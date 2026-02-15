-- Fix Admin Access and Add Sample Data

-- 1. Ensure admin profile exists with correct role
INSERT INTO profiles (
  id, 
  email, 
  full_name, 
  company_name, 
  role, 
  approval_status,
  gst_number
) 
SELECT 
  id,
  email,
  'Admin User' as full_name,
  'Textile Connect Admin' as company_name,
  'admin' as role,
  'APPROVED' as approval_status,
  NULL as gst_number
FROM auth.users 
WHERE email = 'admin@textile-connect.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'admin@textile-connect.com'
);

-- 2. Add sample buyers for testing
INSERT INTO profiles (
  id, 
  email, 
  full_name, 
  company_name, 
  role, 
  approval_status,
  gst_number
) VALUES
  (
    gen_random_uuid(),
    'john@textileco.com',
    'John Smith',
    'Textile Company Ltd',
    'buyer',
    'PENDING',
    '22AAAAA0000A1Z5'
  ),
  (
    gen_random_uuid(),
    'sarah@fashionhub.com',
    'Sarah Johnson',
    'Fashion Hub Exports',
    'buyer',
    'PENDING',
    '33BBBBB1111B2Z6'
  ),
  (
    gen_random_uuid(),
    'mike@uniforms.com',
    'Mike Wilson',
    'Uniforms Direct',
    'buyer',
    'APPROVED',
    '44CCCCC2222C3Z7'
  );

-- 3. Add sample products if they don't exist
INSERT INTO products (
  id,
  name,
  gsm,
  color,
  description,
  base_price,
  stock_quantity,
  image_url
) 
SELECT 
  id, name, gsm, color, description, base_price, stock_quantity, image_url
FROM (VALUES
  (
    gen_random_uuid(),
    'Premium Cotton Twill',
    '180-220',
    'Navy Blue',
    'High-quality cotton twill fabric perfect for workwear and uniforms',
    150.00,
    5000,
    null
  ),
  (
    gen_random_uuid(),
    'Polyester Crepe',
    '120-150',
    'Black',
    'Lightweight polyester crepe fabric ideal for formal wear',
    120.00,
    3000,
    null
  )
) AS t(id, name, gsm, color, description, base_price, stock_quantity, image_url)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- 4. Create sample orders
INSERT INTO orders (
  id,
  buyer_id,
  product_id,
  quantity,
  status,
  created_at
)
SELECT 
  gen_random_uuid(),
  p.id,
  pr.id,
  FLOOR(RANDOM() * 1000 + 100)::integer,
  'PENDING',
  NOW()
FROM profiles p
CROSS JOIN products pr
WHERE p.role = 'buyer'
AND p.approval_status = 'APPROVED'
LIMIT 3;

-- 5. Check data was created
SELECT 'Profiles' as table_name, COUNT(*) as count FROM profiles;
SELECT 'Products' as table_name, COUNT(*) as count FROM products;
SELECT 'Orders' as table_name, COUNT(*) as count FROM orders;
