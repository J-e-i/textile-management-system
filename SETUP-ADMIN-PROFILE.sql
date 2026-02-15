-- Ensure Admin User Profile Exists and is Properly Configured

-- Step 1: Check for admin user in Supabase auth (this shows what should exist)
-- You should have registered with email: admin@textile-connect.com

-- Step 2: Create or update admin profile
-- Replace 'ADMIN_USER_ID' with your actual admin user ID from Supabase Auth
-- You can find it in: Supabase Dashboard > Authentication > Users > Copy the user ID

-- Option A: If you know your admin user ID, run this:
-- UPDATE profiles 
-- SET role = 'admin', approval_status = 'APPROVED'
-- WHERE id = 'PASTE_YOUR_ADMIN_USER_ID_HERE';

-- Option B: Make sure admin@textile-connect.com profile exists as admin
INSERT INTO profiles (id, email, full_name, company_name, role, approval_status)
SELECT 
  auth.uid(),
  email,
  'Admin',
  'Textile Connect',
  'admin',
  'APPROVED'
FROM (
  SELECT 
    id,
    email
  FROM auth.users
  WHERE email = 'admin@textile-connect.com'
) au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'admin@textile-connect.com'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  approval_status = 'APPROVED';

-- Step 3: Verify admin profile was created
SELECT
  'Admin Profile Status' as check_type,
  id,
  email,
  role,
  approval_status,
  created_at
FROM profiles
WHERE email = 'admin@textile-connect.com';

-- Step 4: Check all profiles to see what's there
SELECT
  'Total Profiles' as summary,
  COUNT(*) as total,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'buyer' THEN 1 END) as buyers,
  COUNT(CASE WHEN approval_status = 'PENDING' THEN 1 END) as pending_approvals
FROM profiles;
