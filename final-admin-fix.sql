-- FINAL SIMPLE FIX: Just update admin role and verify

-- Step 1: Update admin profile role (this is all we need)
UPDATE profiles 
SET 
  role = 'admin',
  approval_status = 'APPROVED'
WHERE email = 'admin@textile-connect.com';

-- Step 2: Verify the admin role is set
SELECT 
  'Admin Profile Check' as operation,
  id,
  email, 
  role, 
  approval_status,
  CASE 
    WHEN role = 'admin' THEN '✅ Admin role set correctly'
    ELSE '❌ Admin role NOT set'
  END as status_check
FROM profiles 
WHERE email = 'admin@textile-connect.com';

-- Step 3: Check if admin can access their own profile
SELECT 
  'RLS Policy Test' as operation,
  get_user_role() as current_user_role,
  auth.uid() as current_user_id,
  CASE 
    WHEN get_user_role() = 'admin' THEN '✅ Admin access should work'
    ELSE '❌ Admin access will fail'
  END as access_check;

-- Step 4: List all current policies (for your reference)
SELECT 
  'Current Policies' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'orders', 'products', 'quotations')
ORDER BY tablename, policyname;
