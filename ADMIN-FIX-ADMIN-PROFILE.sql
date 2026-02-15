-- ADMIN-FIX-ADMIN-PROFILE.sql
-- Run this in Supabase → SQL Editor as a project admin.
-- This file checks the auth user and profiles for admin@textile-connect.com
-- and fixes/creates the profile and confirms the email if needed.

-- 1) Inspect auth.users and profiles
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'admin@textile-connect.com';

SELECT id, email, role, approval_status, created_at FROM public.profiles WHERE email = 'admin@textile-connect.com';

-- 2) If a profile exists but role is not 'admin' or approval_status not 'APPROVED', run this to fix it
-- (Uncomment and run if needed)
-- UPDATE public.profiles
-- SET role = 'admin', approval_status = 'APPROVED'
-- WHERE email = 'admin@textile-connect.com';

-- 3) If no profile exists, create one using the auth.users id
-- Replace <USER_ID> below with the id returned by the first SELECT (or use the INSERT .. SELECT)
-- Insert using a single statement that pulls id from auth.users
INSERT INTO public.profiles (id, email, full_name, role, approval_status, created_at)
SELECT u.id, u.email, 'Site Admin', 'admin', 'APPROVED', now()
FROM auth.users u
WHERE u.email = 'admin@textile-connect.com'
ON CONFLICT (id) DO NOTHING;

-- 4) If the admin is being blocked by Supabase email confirmation, mark their email confirmed
-- Run only if you trust this account; this bypasses the email-click step.
-- (Recommended for initial admin only)
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'admin@textile-connect.com';

-- 5) Verify changes
SELECT id, email_confirmed_at FROM auth.users WHERE email = 'admin@textile-connect.com';
SELECT id, email, role, approval_status FROM public.profiles WHERE email = 'admin@textile-connect.com';

-- Notes:
-- - These operations must be run in Supabase SQL Editor by a user with sufficient privileges.
-- - Setting email_confirmed_at manually bypasses the confirmation email. Use only for trusted admin accounts.
-- - To avoid hitting email rate limits when approving many users, consider using manual confirmation for a small number of admins or creating accounts via the Dashboard instead of using the public signup flow repeatedly.
