-- Fix Email Confirmation with Correct Schema

-- Step 1: Check actual schema of profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Check what columns actually exist in profiles
SELECT * FROM profiles LIMIT 1;

-- Step 3: Check what columns exist in auth.users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'auth.users'
ORDER BY ordinal_position;

-- Step 4: Manual email confirmation without approved_at column
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE id IN (
  SELECT p.id 
  FROM profiles p 
  WHERE p.role = 'buyer' 
  AND p.approval_status = 'APPROVED'
  AND p.email LIKE '%@%.com'
);

-- Step 5: Verify the fix
SELECT 
  'Email Confirmation Fix' as status,
  p.id,
  p.email,
  p.approval_status,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '❌ Still not confirmed'
    ELSE '✅ Email confirmed - can login'
  END as final_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'buyer' 
AND p.approval_status = 'APPROVED'
AND p.email LIKE '%@%.com';
