-- Debug and Fix Email Confirmation for Approved Buyers

-- Step 1: Check current status of approved buyers
SELECT 
  'Current Approved Buyers Status' as check_type,
  p.id as buyer_id,
  p.email,
  p.full_name,
  p.approval_status,
  p.approved_at,
  u.email_confirmed_at,
  u.created_at as user_created_at,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email NOT confirmed'
    WHEN u.email_confirmed_at < p.approved_at THEN '❌ Email confirmed BEFORE approval'
    WHEN u.email_confirmed_at >= p.approved_at THEN '✅ Email confirmed AFTER approval'
    ELSE '❓ Unknown status'
  END as email_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.approval_status = 'APPROVED'
AND p.email LIKE '%@%.com'  -- Check the specific emails you approved
ORDER BY p.approved_at DESC;

-- Step 2: Force confirm emails for all approved buyers
UPDATE auth.users 
SET email_confirmed_at = GREATEST(
  COALESCE(email_confirmed_at, '1970-01-01'),
  (SELECT approved_at FROM profiles WHERE id = auth.users.id)
)
WHERE id IN (
  SELECT p.id 
  FROM profiles p 
  WHERE p.approval_status = 'APPROVED'
  AND p.email LIKE '%@%.com'
);

-- Step 3: Verify the fix worked
SELECT 
  'After Fix Status' as check_type,
  p.id as buyer_id,
  p.email,
  p.full_name,
  p.approval_status,
  p.approved_at,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at >= p.approved_at THEN '✅ Can login now'
    ELSE '❌ Still cannot login'
  END as final_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.approval_status = 'APPROVED'
AND p.email LIKE '%@%.com'
ORDER BY p.approved_at DESC;

-- Step 4: Test specific buyer login (replace with actual email)
-- This query simulates what happens when buyer tries to login
SELECT 
  'Login Test' as test_type,
  'Buyer Email' as email_field,
  CASE 
    WHEN (SELECT email_confirmed_at FROM auth.users WHERE email = 'buyer-email-here') IS NOT NULL 
    THEN '✅ Should be able to login'
    ELSE '❌ Will fail login'
  END as login_result
WHERE email = 'buyer-email-here';
