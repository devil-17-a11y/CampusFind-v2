-- STEP 2: Run AFTER supabase/super_admin_upgrade.sql
-- Replace the email placeholder below with an EXISTING Supabase Auth email.
-- Run ONLY from the trusted Supabase SQL Editor, not from the client application.
DO $$
DECLARE
  target_email text := 'your-email@example.com';
  target_id uuid;
BEGIN
  SELECT id INTO target_id
  FROM auth.users
  WHERE lower(email) = lower(trim(target_email));

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No registered authentication user with email: %', target_email;
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  SELECT id, COALESCE(raw_user_meta_data->>'full_name',''), 'super_admin'
  FROM auth.users WHERE id = target_id
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  RAISE NOTICE 'Assigned Super Admin role to %', target_email;
END;
$$;

-- Verify target account role:
SELECT u.email, p.role
FROM auth.users AS u
JOIN public.profiles AS p ON p.id = u.id
WHERE lower(u.email) = lower('your-email@example.com');
