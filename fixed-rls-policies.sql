-- Fixed RLS Policy for Secure Access

-- Step 1: Create function to check user status
CREATE OR REPLACE FUNCTION is_user_verified_and_approved()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE p.id = auth.uid()
    AND p.approval_status = 'APPROVED'
    AND u.email_confirmed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Only approved users can access" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Step 3: Create correct RLS policies
CREATE POLICY "Only verified and approved users can view profiles"
ON profiles
FOR SELECT
USING (is_user_verified_and_approved());

CREATE POLICY "Only verified and approved users can update own profile"
ON profiles
FOR UPDATE
USING (is_user_verified_and_approved() AND id = auth.uid());

CREATE POLICY "Only verified and approved users can insert profiles"
ON profiles
FOR INSERT
WITH CHECK (is_user_verified_and_approved());

-- Step 4: Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Test the policy
SELECT 
  'RLS Policy Test' as test_result,
  auth.uid() as current_user_id,
  is_user_verified_and_approved() as can_access,
  CASE 
    WHEN is_user_verified_and_approved() THEN '✅ User can access'
    ELSE '❌ User blocked by RLS'
  END as access_status;
