-- Manual Email Confirmation for Approved Buyers

-- Step 1: Check which approved buyers need email confirmation
SELECT 
  'Approved Buyers Needing Confirmation' as status,
  p.id,
  p.email,
  p.full_name,
  p.company_name,
  p.approval_status,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email not confirmed'
    ELSE '✅ Email confirmed'
  END as confirmation_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'buyer' 
AND p.approval_status = 'APPROVED'
AND u.email_confirmed_at IS NULL;

-- Step 2: Manually confirm email for approved buyers
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE id IN (
  SELECT p.id 
  FROM profiles p 
  JOIN auth.users u ON p.id = u.id
  WHERE p.role = 'buyer' 
  AND p.approval_status = 'APPROVED'
  AND u.email_confirmed_at IS NULL
);

-- Step 3: Verify the confirmation worked
SELECT 
  'Confirmation Results' as status,
  p.id,
  p.email,
  p.full_name,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Now confirmed and can login'
    ELSE '❌ Still not confirmed'
  END as final_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'buyer' 
AND p.approval_status = 'APPROVED';
