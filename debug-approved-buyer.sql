-- Debug Approved Buyer Issue

-- Step 1: Check if test buyer exists and what their status is
SELECT 
  'Buyer Status Check' as check_type,
  p.id,
  p.email,
  p.full_name,
  p.approval_status,
  p.approved_at,
  u.email_confirmed_at,
  u.created_at as user_created_at,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email not confirmed - cannot login'
    WHEN u.email_confirmed_at < p.approved_at THEN '❌ Email confirmed before approval - should work'
    WHEN u.email_confirmed_at >= p.approved_at THEN '✅ Email confirmed after approval - should work'
    ELSE '❓ Unknown state'
  END as login_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'test-manual@example.com';

-- Step 2: Check all approved buyers and their email confirmation status
SELECT 
  'All Approved Buyers' as check_type,
  COUNT(*) as total_approved,
  COUNT(CASE WHEN u.email_confirmed_at IS NOT NULL THEN 1 END) as not_confirmed,
  COUNT(CASE WHEN u.email_confirmed_at IS NOT NULL THEN 0 ELSE 1 END) as confirmed
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.approval_status = 'APPROVED'
AND p.role = 'buyer';

-- Step 3: Check what the admin dashboard is actually fetching
-- This will help us see if the issue is in the frontend or backend
SELECT 
  'Dashboard Debug' as check_type,
  'Buyers being fetched' as status,
  COUNT(*) as buyer_count
FROM profiles 
WHERE role = 'buyer'
AND approval_status IN ('PENDING', 'APPROVED', 'REJECTED');

-- Step 4: Check if RLS policies are blocking access
SELECT 
  'RLS Check' as check_type,
  auth.uid() as current_user_id,
  get_user_role() as current_role,
  CASE 
    WHEN get_user_role() = 'admin' THEN '✅ Admin has access'
    ELSE '❌ Admin access blocked'
  END as access_check
FROM (SELECT 1) dummy_data;
