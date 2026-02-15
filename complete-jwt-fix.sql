-- Complete JWT and RLS Fix for Admin Access

-- Step 1: Create custom function to get user role in JWT
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.claims', '{}')::json->>'role',
    'buyer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Update admin profile to include role in user_metadata
UPDATE profiles 
SET 
  user_metadata = jsonb_set(
    COALESCE(user_metadata, '{}')::jsonb,
    '{ "role": "admin" }'::jsonb
  )
WHERE email = 'admin@textile-connect.com';

-- Step 3: Update all RLS policies to use the new function

-- Profiles policy (fixed)
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;

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
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;

CREATE POLICY "Admin full access to orders" ON orders
  FOR ALL USING (
    get_user_role() = 'admin' OR 
    auth.uid() = buyer_id
  );

-- Quotations policy (fixed)
DROP POLICY IF EXISTS "Admin full access to quotations" ON quotations;

CREATE POLICY "Admin full access to quotations" ON quotations
  FOR ALL USING (
    get_user_role() = 'admin' OR 
    auth.uid() = (SELECT buyer_id FROM orders WHERE orders.id = quotations.order_id)
  );

-- Step 4: Update auth.users to include role in raw_user_meta_data
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}')::jsonb,
    '{ "role": "admin" }'::jsonb
  )
WHERE email = 'admin@textile-connect.com';

-- Step 5: Verify the fixes
-- Check table structure first
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name LIKE '%metadata%';

-- Check current admin profile
SELECT id, email, role, user_metadata, raw_user_meta_data 
FROM profiles 
WHERE email = 'admin@textile-connect.com';

-- Verify the fixes
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
