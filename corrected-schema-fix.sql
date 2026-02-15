-- CORRECTED: Fix for actual schema with role column

-- Step 1: Update admin profile to set role directly
UPDATE profiles 
SET 
  role = 'admin',
  approval_status = 'APPROVED'
WHERE email = 'admin@textile-connect.com';

-- Step 2: Create custom function to get user role from profiles table
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM profiles WHERE id = auth.uid()),
    'buyer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Update all RLS policies to use the new function

-- Profiles policy (fixed)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (
    get_user_role() = 'admin' OR 
    auth.uid() = id
  );

-- Products policy (fixed)
DROP POLICY IF EXISTS "Admin full access to products" ON products;

CREATE POLICY "Admin full access to products" ON products
  FOR ALL USING (
    get_user_role() = 'admin'
  );

-- Orders policy (fixed)
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

CREATE POLICY "Admin full access to orders" ON orders
  FOR ALL USING (
    get_user_role() = 'admin' OR 
    auth.uid() = buyer_id
  );

-- Quotations policy (fixed)
DROP POLICY IF EXISTS "Users can view their own quotations" ON quotations;

CREATE POLICY "Admin full access to quotations" ON quotations
  FOR ALL USING (
    get_user_role() = 'admin' OR 
    auth.uid() = (SELECT buyer_id FROM orders WHERE orders.id = quotations.order_id)
  );

-- Step 4: Verify the fixes
SELECT 
  'Profiles' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count
FROM profiles;

SELECT 
  'Auth Users' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN raw_user_meta_data->>'role' = '"admin"' THEN 1 END) as admin_count
FROM auth.users;

-- Step 5: Check current admin profile
SELECT id, email, role, approval_status 
FROM profiles 
WHERE email = 'admin@textile-connect.com';
