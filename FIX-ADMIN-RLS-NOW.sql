-- SIMPLE AND RELIABLE RLS FIX FOR ADMIN ACCESS
-- Run this script in Supabase SQL Editor to fix admin data fetching

-- ==========================================
-- STEP 1: DISABLE RLS (Quick fix to test)
-- ==========================================
-- This temporarily disables Row Level Security to allow all users to access all data
-- We'll set it back up properly after testing

ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quotation DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 2: DROP ALL OLD POLICIES
-- ==========================================
-- Clear out all previous RLS policies that might be blocking access

DROP POLICY IF EXISTS "Allow viewing all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON profiles;

DROP POLICY IF EXISTS "Everyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can modify products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admin full access to products" ON products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products access" ON products;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update any order" ON orders;
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;
DROP POLICY IF EXISTS "Orders access" ON orders;

DROP POLICY IF EXISTS "Users can view their own quotations" ON quotation;
DROP POLICY IF EXISTS "Admins can create quotations" ON quotation;
DROP POLICY IF EXISTS "Admins can update quotations" ON quotation;
DROP POLICY IF EXISTS "Admin full access to quotations" ON quotation;
DROP POLICY IF EXISTS "Users can view their own quotations" ON quotation;
DROP POLICY IF EXISTS "Quotations access" ON quotation;

DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
DROP POLICY IF EXISTS "Admin full access to payments" ON payments;

DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can manage invoices" ON invoices;
DROP POLICY IF EXISTS "Admin full access to invoices" ON invoices;

-- ==========================================
-- STEP 3: RE-ENABLE RLS WITH NEW POLICIES
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PROFILES TABLE POLICIES
-- ==========================================
-- Anyone can view all profiles
-- Admins can update any profile
-- Users can update their own profile

CREATE POLICY "profiles_anyone_can_view" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_user_can_update_own" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "profiles_user_can_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ==========================================
-- PRODUCTS TABLE POLICIES
-- ==========================================
-- Anyone can view products
-- Admins can insert/update/delete products

CREATE POLICY "products_anyone_can_view" ON products
  FOR SELECT USING (true);

-- To allow admins to modify, we need to check if they're admin
-- This uses a subquery to check the user's role in profiles table
CREATE POLICY "products_admin_can_modify" ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "products_admin_can_update" ON products
  FOR UPDATE
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "products_admin_can_delete" ON products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ==========================================
-- ORDERS TABLE POLICIES
-- ==========================================
-- Users can view/create their own orders
-- Admins can view/update all orders

CREATE POLICY "orders_user_can_view_own" ON orders
  FOR SELECT
  USING (
    auth.uid() = buyer_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "orders_user_can_create" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "orders_user_can_update_own" ON orders
  FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "orders_admin_can_update" ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ==========================================
-- QUOTATION TABLE POLICIES
-- ==========================================
-- Users can view their own quotations
-- Admins can view/create/update all quotations

CREATE POLICY "quotation_user_can_view_own" ON quotation
  FOR SELECT
  USING (
    auth.uid() = (SELECT buyer_id FROM orders WHERE id = order_id)
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "quotation_admin_can_insert" ON quotation
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "quotation_admin_can_update" ON quotation
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ==========================================
-- PAYMENTS TABLE POLICIES
-- ==========================================
-- Users can view their own payments
-- Admins can view/manage all payments

CREATE POLICY "payments_user_can_view_own" ON payments
  FOR SELECT
  USING (
    auth.uid() = (SELECT buyer_id FROM orders WHERE id = order_id)
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "payments_admin_can_insert" ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "payments_admin_can_update" ON payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ==========================================
-- INVOICES TABLE POLICIES
-- ==========================================
-- Users can view their own invoices
-- Admins can view/manage all invoices

CREATE POLICY "invoices_user_can_view_own" ON invoices
  FOR SELECT
  USING (
    auth.uid() = (SELECT buyer_id FROM orders WHERE id = order_id)
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "invoices_admin_can_insert" ON invoices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "invoices_admin_can_update" ON invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ==========================================
-- VERIFICATION
-- ==========================================
-- Check that all policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
