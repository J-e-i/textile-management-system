-- Complete RLS Policy Fix - Drop and Recreate All Policies

-- Step 1: Drop ALL existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Admin full access to products" ON products;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;

DROP POLICY IF EXISTS "Users can view their own quotations" ON quotation;
DROP POLICY IF EXISTS "Admin full access to quotations" ON quotation;

-- Step 2: Create simple, clean policies for admin access

-- Profiles policy - Admin can access all profiles, users can only access their own
CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
    auth.uid() = id
  );

-- Products policy - Admin can access all products, everyone can view
CREATE POLICY "Products access" ON products
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'buyer'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Orders policy - Admin can access all orders, buyers can only access their own
CREATE POLICY "Orders access" ON orders
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
    auth.uid() = buyer_id
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
    auth.uid() = buyer_id
  );

-- Quotations policy - Admin can access all quotations, buyers can only access their own
CREATE POLICY "Quotations access" ON quotation
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
    auth.uid() = (SELECT buyer_id FROM orders WHERE orders.id = quotation.order_id)
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
    auth.uid() = (SELECT buyer_id FROM orders WHERE orders.id = quotation.order_id)
  );

-- Step 3: Verify policies were created successfully
SELECT 
  'Policy Creation Status' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'orders', 'products', 'quotation')
ORDER BY tablename, policyname;
