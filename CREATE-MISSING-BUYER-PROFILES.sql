-- FIX: Create Missing Buyer Profiles for All Orphaned Auth Users
-- This will create profile records for all users who registered but have no profile yet

-- Step 1: Get user metadata from auth.users and insert missing profiles
INSERT INTO profiles (id, email, full_name, company_name, gst_number, role, approval_status, created_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User', 'Unknown'),
  COALESCE(u.raw_user_meta_data->>'company_name', 'Company'),
  COALESCE(u.raw_user_meta_data->>'gst_number', ''),
  'buyer',
  'PENDING',
  u.created_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = u.id
)
AND u.email NOT LIKE '%admin%'  -- Don't create profile for admin accounts
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify how many profiles were created
SELECT 
  'Profile Creation Result' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'buyer' THEN 1 END) as buyer_count,
  COUNT(CASE WHEN approval_status = 'PENDING' THEN 1 END) as pending_approvals
FROM profiles;

-- Step 3: Show all buyer profiles that were just created
SELECT 
  email,
  full_name,
  company_name,
  gst_number,
  role,
  approval_status,
  created_at
FROM profiles
WHERE role = 'buyer'
ORDER BY created_at DESC;
