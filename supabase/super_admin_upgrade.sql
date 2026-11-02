-- CAMPUSFIND: ADD SUPER ADMIN TO AN EXISTING SUPABASE PROJECT
-- Back up your database first. Run in Supabase SQL Editor (privileged editor).
-- The initial Super Admin is assigned in super_admin_assign.sql AFTER this migration.
-- This script preserves all existing users, reports and claims.

BEGIN;

-- Existing profile role constraint only allows student/admin.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student','admin','super_admin'));

-- Treat Super Admin as admin for existing RLS policies and trusted functions.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('admin','super_admin')
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Dedicated capability check for privileged user management.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'super_admin'
  );
$$;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- AAL2-verified Super Admin can list accounts for role management.
-- Does not return password hashes, recovery factors, or auth secrets.
CREATE OR REPLACE FUNCTION public.list_manageable_users()
RETURNS TABLE (id uuid, email text, full_name text, role text)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL
     OR NOT public.is_super_admin()
     OR COALESCE(auth.jwt()->>'aal', '') <> 'aal2'
  THEN
    RAISE EXCEPTION 'Verified Super Admin access required';
  END IF;

  RETURN QUERY
    SELECT p.id, u.email::text, p.full_name, p.role
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.role <> 'super_admin'
    ORDER BY u.email;
END;
$$;
REVOKE ALL ON FUNCTION public.list_manageable_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_manageable_users() TO authenticated;

-- Super Admin can promote/demote ordinary accounts between student/admin.
-- Super Admin grants and changes remain SQL-editor-only; cannot alter self.
CREATE OR REPLACE FUNCTION public.set_managed_user_role(
  p_user_id uuid,
  p_new_role text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_previous text;
BEGIN
  IF (SELECT auth.uid()) IS NULL
     OR NOT public.is_super_admin()
     OR COALESCE(auth.jwt()->>'aal','') <> 'aal2'
  THEN
    RAISE EXCEPTION 'Verified Super Admin access required';
  END IF;
  IF p_new_role NOT IN ('student','admin') OR p_new_role IS NULL THEN
    RAISE EXCEPTION 'Only student and admin roles can be assigned here';
  END IF;
  IF p_user_id = (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Cannot modify your own role';
  END IF;

  SELECT role INTO v_previous
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found';
  END IF;
  IF v_previous = 'super_admin' THEN
    RAISE EXCEPTION 'Super Admin roles must be managed in the SQL Editor';
  END IF;
  IF v_previous = p_new_role THEN RETURN; END IF;

  UPDATE public.profiles SET role = p_new_role WHERE id = p_user_id;
  INSERT INTO public.admin_logs(admin_id,action)
  VALUES ((SELECT auth.uid()),
    'Updated account ' || p_user_id::text || ' role ' || v_previous || ' -> ' || p_new_role);
END;
$$;
REVOKE ALL ON FUNCTION public.set_managed_user_role(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_managed_user_role(uuid,text) TO authenticated;

COMMIT;
