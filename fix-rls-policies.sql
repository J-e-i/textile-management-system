-- Fix RLS Policies for Admin Access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON profiles;

-- Create new policies that allow admin full access
CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.uid() = id
  );

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Products policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;

CREATE POLICY "Admin full access to products" ON products
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

CREATE POLICY "Admin full access to orders" ON orders
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.uid() = buyer_id
  );

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Quotations policies
DROP POLICY IF EXISTS "Users can view their own quotations" ON quotations;

CREATE POLICY "Admin full access to quotations" ON quotations
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.uid() = (SELECT buyer_id FROM orders WHERE orders.id = quotations.order_id)
  );

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
