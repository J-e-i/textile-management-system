-- Check What's Auto-Confirming Email

-- Step 1: Check current email confirmation status
SELECT 
  'Current Status' as check_type,
  p.email,
  p.approval_status,
  u.email_confirmed_at,
  u.created_at as user_created_at,
  u.updated_at as user_updated_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '❌ Email auto-confirmed - this is the problem'
    ELSE '✅ Email not confirmed - this is correct'
  END as status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'jeyavels758@gmail.com';

-- Step 2: Check if there are any triggers or functions auto-confirming email
SELECT 
  'Triggers Check' as check_type,
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_definition ILIKE '%email_confirmed_at%';

-- Step 3: Check for any triggers on profiles table
SELECT 
  'Triggers on Profiles' as check_type,
  trigger_name,
  event_manipulation,
  action_timing,
  action_condition,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
AND trigger_schema = 'public';

-- Step 4: Check if there are any functions that update email_confirmed_at
SELECT 
  'Functions Updating Email' as check_type,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_definition ILIKE '%email_confirmed_at%';
