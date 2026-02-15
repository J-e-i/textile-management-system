-- Create Admin User
-- IMPORTANT: First create the auth user in Supabase Authentication with email admin@textile-connect.com
-- Then get the actual UUID from auth.users and replace it below, or use this dynamic approach:

-- Admin Profile (using the actual auth user ID)
-- Method 1: If you know the auth user UUID, replace 'YOUR_ADMIN_UUID_HERE' with the actual ID
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
  id, -- Use the actual auth user ID
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

-- Alternative Method 2: If you prefer to manually insert with a specific UUID
-- First get the UUID from: SELECT id, email FROM auth.users WHERE email = 'admin@textile-connect.com';
-- Then use that UUID in the INSERT statement below:
-- INSERT INTO profiles (id, email, full_name, company_name, role, approval_status, gst_number)
-- VALUES ('ACTUAL_UUID_FROM_AUTH_USERS', 'admin@textile-connect.com', 'Admin User', 'Textile Connect Admin', 'admin', 'APPROVED', NULL);

-- Sample Products
INSERT INTO products (
  id,
  name,
  gsm,
  color,
  description,
  base_price,
  stock_quantity,
  image_url
) VALUES
  (
    gen_random_uuid(),
    'Premium Cotton Twill',
    '180-220',
    'Navy Blue',
    'High-quality cotton twill fabric perfect for workwear and uniforms. Durable and comfortable with excellent color retention.',
    150.00,
    5000,
    null
  ),
  (
    gen_random_uuid(),
    'Polyester Crepe',
    '120-150',
    'Black',
    'Lightweight polyester crepe fabric ideal for formal wear and dresses. Excellent drape and wrinkle resistance.',
    120.00,
    3000,
    null
  ),
  (
    gen_random_uuid(),
    'Stretch Denim',
    '280-320',
    'Indigo',
    'Premium stretch denim with 2% spandex for comfort. Perfect for jeans and jackets.',
    200.00,
    2000,
    null
  );

-- Sample Buyer (for testing)
-- First create auth user with email buyer@test.com in Supabase Authentication
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
  id, -- Use the actual auth user ID
  email,
  'Test Buyer' as full_name,
  'Test Textiles Ltd' as company_name,
  'buyer' as role,
  'APPROVED' as approval_status,
  '22AAAAA0000A1Z5' as gst_number
FROM auth.users 
WHERE email = 'buyer@test.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'buyer@test.com'
);
