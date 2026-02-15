-- DIAGNOSTIC: Check if RLS Policies are Blocking Profile Creation
-- Run this to verify everything is set up correctly

-- Check 1: Are RLS policies enabled on profiles table?
SELECT 
  'RLS Status' as check,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check 2: What policies exist on profiles table?
SELECT 
  'Policies on profiles' as check,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as security_type
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check 3: Count total profiles in database
SELECT 
  'Total Profiles' as check,
  COUNT(*) as total,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'buyer' THEN 1 END) as buyer_count,
  COUNT(CASE WHEN approval_status = 'PENDING' THEN 1 END) as pending_count,
  COUNT(CASE WHEN approval_status = 'APPROVED' THEN 1 END) as approved_count
FROM profiles;

-- Check 4: List all profiles (to see who exists)
SELECT 
  id,
  email,
  full_name,
  company_name,
  role,
  approval_status,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Check 5: Check if there are any auth users who don't have profiles
SELECT 
  'Auth Users Without Profiles' as check,
  u.id,
  u.email,
  (SELECT COUNT(*) FROM profiles WHERE id = u.id) as has_profile
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id)
ORDER BY u.created_at DESC;
