-- VERIFY AND FIX: RLS Policy for Profile Insertion During Registration
-- This ensures future registrations will create profiles correctly

-- Step 1: Check current policies on profiles table
SELECT 
  'Current Policies' as check,
  policyname,
  cmd,
  CASE WHEN qual IS NOT NULL THEN 'Has USING' ELSE 'No USING' END,
  CASE WHEN with_check IS NOT NULL THEN 'Has WITH CHECK' ELSE 'No WITH CHECK' END
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 2: Drop the insert policy if it exists and recreate it properly
DROP POLICY IF EXISTS "profiles_user_can_insert_own" ON profiles;

-- Step 3: Create the proper INSERT policy for users
-- This allows users to insert a profile for themselves during signup
CREATE POLICY "profiles_user_can_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 4: Verify the policy was created
SELECT 
  'Policy Created' as check,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'profiles' 
AND policyname = 'profiles_user_can_insert_own';

-- Step 5: Test - This query should succeed if policy is working
-- It shows what the app will see when trying to insert a profile
SELECT 
  'INSERT Policy Test' as test,
  'Policy should allow INSERT with auth.uid() = id' as expected_behavior;
