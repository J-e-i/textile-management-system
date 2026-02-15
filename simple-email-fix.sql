-- Simple Direct Fix for Email Confirmation

-- Step 1: Direct update without complex conditions
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email IN (
  'john@textileco.com',
  'sarah@fashionhub.com', 
  'mike@uniforms.com'
);

-- Step 2: Verify the update worked
SELECT 
  'Direct Update Result' as check_type,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '❌ Still NULL'
    ELSE '✅ Confirmed successfully'
  END as status
FROM auth.users 
WHERE email IN (
  'john@textileco.com',
  'sarah@fashionhub.com', 
  'mike@uniforms.com'
);

-- Step 3: Test login simulation
SELECT 
  'Login Test' as test_type,
  email,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Should be able to login'
    ELSE '❌ Will still fail login'
  END as login_result
FROM auth.users 
WHERE email = 'john@textileco.com';

-- Step 4: Check all approved buyers status
SELECT 
  'Final Status Check' as status,
  p.email as buyer_email,
  p.approval_status,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '❌ Cannot login'
    ELSE '✅ Can login now'
  END as can_login
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.approval_status = 'APPROVED';
