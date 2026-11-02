-- CampusFind optional features migration: ADDITIVE migration for an EXISTING project.
-- First back up Supabase. Apply original schema.sql only to a NEW project.
-- No modifications to existing reports, users, claims or item photos.
create extension if not exists pgcrypto;

create table if not exists public.portal_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  visitor_key uuid not null,
  page_path text not null,
  source text not null default 'direct',
  medium text not null default 'none',
  campaign text not null default '',
  referrer_host text not null default '',
  device text not null default 'desktop'
);
create index if not exists idx_portal_events_time on public.portal_events(occurred_at desc);
create index if not exists idx_portal_events_page on public.portal_events(page_path);
alter table public.portal_events enable row level security;
-- No direct public SELECT or INSERT; event collection uses a restricted RPC.

create table if not exists public.portal_settings (
  singleton boolean primary key default true check (singleton),
  project_name text not null default 'CampusFind',
  ga4_measurement_id text not null default '',
  gsc_property_url text not null default '',
  consent_notice text not null default 'Allow anonymous page-view analytics to improve this campus portal?',
  updated_at timestamptz not null default now()
);
insert into public.portal_settings(singleton) values(true) on conflict do nothing;
alter table public.portal_settings enable row level security;
-- This table contains PUBLIC presentation configuration, never credentials.
drop policy if exists "portal settings public read" on public.portal_settings;
create policy "portal settings public read" on public.portal_settings for select to anon,authenticated using(true);
drop policy if exists "portal settings admin update" on public.portal_settings;
create policy "portal settings admin update" on public.portal_settings for update to authenticated
  using(public.is_admin() and (auth.jwt()->>'aal')='aal2')
  with check(public.is_admin() and (auth.jwt()->>'aal')='aal2');

-- Privacy: only logs after visitors accept analytics; never email, full URLs,
-- search terms, IP address, user agent or ownership proof.
create or replace function public.record_portal_view(
 p_visitor_key uuid, p_page_path text, p_source text default 'direct',
 p_medium text default 'none', p_campaign text default '',
 p_referrer_host text default '', p_device text default 'desktop'
) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if p_visitor_key is null or p_page_path is null or
     p_page_path !~ '^/[a-zA-Z0-9_/-]*$' or length(p_page_path)>120 then return false; end if;
  if p_page_path ~ '^/(admin|login|signup|account|claims|dashboard|forgot-password|reset-password|mfa)' then return false; end if;
  if (select count(*) from public.portal_events where visitor_key=p_visitor_key and occurred_at>now()-interval '1 minute') >= 20 then return false; end if;
  insert into public.portal_events(visitor_key,page_path,source,medium,campaign,referrer_host,device)
  values (p_visitor_key,p_page_path,
    left(regexp_replace(coalesce(p_source,'direct'),'[^A-Za-z0-9._ -]','','g'),60),
    left(regexp_replace(coalesce(p_medium,'none'),'[^A-Za-z0-9._ -]','','g'),60),
    left(regexp_replace(coalesce(p_campaign,''),'[^A-Za-z0-9._ -]','','g'),80),
    left(regexp_replace(coalesce(p_referrer_host,''),'[^A-Za-z0-9.-]','','g'),100),
    case when p_device in('mobile','tablet','desktop') then p_device else 'desktop' end);
  return true;
end; $$;
revoke all on function public.record_portal_view(uuid,text,text,text,text,text,text) from public;
grant execute on function public.record_portal_view(uuid,text,text,text,text,text,text) to anon,authenticated;

create or replace function public.portal_insights(p_days int default 30)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare since timestamptz; result jsonb;
begin
 if not public.is_admin() or coalesce(auth.jwt()->>'aal','') <> 'aal2' then raise exception 'Admin multi-factor authentication required'; end if;
 since:=now() - make_interval(days => least(greatest(p_days,1),90));
 select jsonb_build_object(
   'views', (select count(*) from public.portal_events where occurred_at>=since),
   'visitors', (select count(distinct visitor_key) from public.portal_events where occurred_at>=since),
   'daily', coalesce((select jsonb_agg(row_to_json(t) order by t.day) from (
      select occurred_at::date as day, count(*) as views, count(distinct visitor_key) as visitors
      from public.portal_events where occurred_at>=since group by 1 order by 1
   ) t),'[]'::jsonb),
   'pages', coalesce((select jsonb_agg(row_to_json(t) order by t.views desc) from (
      select page_path as name, count(*) as views from public.portal_events where occurred_at>=since group by 1 order by 2 desc limit 10
   ) t),'[]'::jsonb),
   'sources', coalesce((select jsonb_agg(row_to_json(t) order by t.views desc) from (
      select source as name, count(*) as views from public.portal_events where occurred_at>=since group by 1 order by 2 desc limit 10
   ) t),'[]'::jsonb),
   'campaigns', coalesce((select jsonb_agg(row_to_json(t) order by t.views desc) from (
      select campaign as name, count(*) as views from public.portal_events where occurred_at>=since and campaign<>'' group by 1 order by 2 desc limit 10
   ) t),'[]'::jsonb),
   'devices', coalesce((select jsonb_agg(row_to_json(t) order by t.views desc) from (
      select device as name, count(*) as views from public.portal_events where occurred_at>=since group by 1 order by 2 desc
   ) t),'[]'::jsonb)
 ) into result;
 return result;
end; $$;
revoke all on function public.portal_insights(int) from public;
grant execute on function public.portal_insights(int) to authenticated;

-- Additional MFA protection for existing admin data access.
drop policy if exists "claims own or admin read" on public.claims;
create policy "claims own or admin read" on public.claims for select to authenticated
 using(claimant_id=(select auth.uid()) or (public.is_admin() and (auth.jwt()->>'aal')='aal2'));
drop policy if exists "logs admins read" on public.admin_logs;
create policy "logs admins read" on public.admin_logs for select to authenticated
 using(public.is_admin() and (auth.jwt()->>'aal')='aal2');
drop policy if exists "history own or admin read" on public.status_history;
create policy "history own or admin read" on public.status_history for select to authenticated
 using((public.is_admin() and (auth.jwt()->>'aal')='aal2') or exists(select 1 from public.items i where i.id=item_id and i.user_id=(select auth.uid())));

-- Secure approval RPC (replaces v2 implementation, preserves behavior).
create or replace function public.review_ownership_claim(p_claim_id uuid,p_decision text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_claim public.claims%rowtype; v_item public.items%rowtype; v_new text;
begin
 if (select auth.uid()) is null or not public.is_admin() or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Admin MFA verification required'; end if;
 if p_decision not in ('approved','rejected') then raise exception 'Invalid decision'; end if;
 select * into v_claim from public.claims where id=p_claim_id for update;
 if not found then raise exception 'Claim not found'; end if;
 if v_claim.status<>'pending' then raise exception 'This claim was already reviewed'; end if;
 select * into v_item from public.items where id=v_claim.item_id for update;
 if v_item.status='returned' or v_item.item_type<>'found' then raise exception 'Item not eligible'; end if;
 update public.claims set status=p_decision,reviewed_by=(select auth.uid()),reviewed_at=now() where id=p_claim_id;
 if p_decision='approved' then
   update public.claims set status='rejected',reviewed_by=(select auth.uid()),reviewed_at=now() where item_id=v_item.id and id<>p_claim_id and status='pending';
   v_new:='returned';
 else
   v_new:=case when exists(select 1 from public.claims where item_id=v_item.id and status='pending') then 'claim_pending' else 'found' end;
 end if;
 update public.items set status=v_new, updated_at=now() where id=v_item.id;
 insert into public.status_history(item_id,changed_by,old_status,new_status) values(v_item.id,(select auth.uid()),v_item.status,v_new);
 insert into public.admin_logs(admin_id,action) values((select auth.uid()),'Reviewed claim '||p_claim_id||' as '||p_decision);
end;$$;
revoke all on function public.review_ownership_claim(uuid,text) from public;
grant execute on function public.review_ownership_claim(uuid,text) to authenticated;

-- Restrict access to other students' profile data to MFA-verified staff.
drop policy if exists "profiles self or admin read" on public.profiles;
create policy "profiles self or admin read" on public.profiles for select to authenticated
 using(id=(select auth.uid()) or (public.is_admin() and (auth.jwt()->>'aal')='aal2'));
create index if not exists idx_portal_events_visitor_time on public.portal_events(visitor_key,occurred_at desc);
