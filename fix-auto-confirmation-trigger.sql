-- Fix Auto-Confirmation Issue

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS trigger_auto_confirm_approved_buyer ON profiles;

-- Step 2: Drop the trigger function
DROP FUNCTION IF EXISTS auto_confirm_approved_buyer();

-- Step 3: Verify the trigger is removed
SELECT 
  'Trigger Removal Check' as check_type,
  trigger_name,
  event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
AND trigger_schema = 'public';

-- Step 4: Test current email confirmation status
SELECT 
  'Email Status After Fix' as check_type,
  p.email,
  p.approval_status,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '❌ Email still confirmed - need to reset'
    ELSE '✅ Email not confirmed - this is correct'
  END as status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'jeyavels758@gmail.com';

-- Step 5: Reset email confirmation for existing approved users (optional)
UPDATE auth.users 
SET email_confirmed_at = NULL
WHERE id IN (
  SELECT p.id 
  FROM profiles p 
  WHERE p.approval_status = 'APPROVED'
  AND p.email = 'jeyavels758@gmail.com'
);

-- Step 6: Final verification
SELECT 
  'Final Status' as check_type,
  p.email,
  p.approval_status,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '✅ Email not confirmed - user must click confirmation email'
    ELSE '❌ Email still confirmed'
  END as final_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'jeyavels758@gmail.com';
