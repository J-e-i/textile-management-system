-- CRITICAL FIX: Admin RLS Access Issue
-- The current RLS policies are too restrictive and prevent admins from accessing data
-- This script replaces them with simpler, more reliable policies

-- Step 1: Disable RLS temporarily to fix the issue
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotation DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing conflicting policies
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access to products" ON products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products access" ON products;
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Orders access" ON orders;
DROP POLICY IF EXISTS "Admin full access to quotations" ON quotation;
DROP POLICY IF EXISTS "Users can view their own quotations" ON quotation;
DROP POLICY IF EXISTS "Quotations access" ON quotation;
DROP POLICY IF EXISTS "Admin full access to payments" ON payments;
DROP POLICY IF EXISTS "Admin full access to invoices" ON invoices;

-- Step 3: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new, simpler RLS policies that actually work

-- PROFILES: Everyone can view and admins can modify
CREATE POLICY "Allow viewing all profiles" ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (true);

-- PRODUCTS: Everyone can view, only admins can modify
CREATE POLICY "Everyone can view products" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can modify products" ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update products" ON products
  FOR UPDATE
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ORDERS: Users can view/modify their own, admins can view/modify all
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT
  USING (auth.uid() = buyer_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can update any order" ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (true);

-- QUOTATION: Users can view their own, admins can view/modify all
CREATE POLICY "Users can view their own quotations" ON quotation
  FOR SELECT
  USING (
    auth.uid() = (SELECT buyer_id FROM orders WHERE id = order_id) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create quotations" ON quotation
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update quotations" ON quotation
  FOR UPDATE
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- PAYMENTS: Users can view their own, admins can view/modify all
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT
  USING (
    auth.uid() = (SELECT buyer_id FROM orders WHERE id = order_id) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- INVOICES: Users can view their own, admins can view all
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT
  USING (
    auth.uid() = (SELECT buyer_id FROM orders WHERE id = order_id) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage invoices" ON invoices
  FOR ALL
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Step 5: Verify the setup
SELECT 
  'RLS Setup Complete' as status,
  COUNT(*) as total_profiles,
  SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
  SUM(CASE WHEN role = 'buyer' THEN 1 ELSE 0 END) as buyer_count
FROM profiles;
