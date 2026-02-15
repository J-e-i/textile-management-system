-- DEBUG: Check if admin user exists and what role they have
-- Run this in Supabase SQL Editor to debug the issue

-- 1. Check if auth user exists
SELECT 'AUTH USERS' as table_name, id, email, created_at 
FROM auth.users 
WHERE email = 'admin@textile-connect.com';

-- 2. Check if profile exists
SELECT 'PROFILES' as table_name, id, email, role, approval_status, full_name, company_name
FROM profiles 
WHERE email = 'admin@textile-connect.com';

-- 3. Check all users and their roles
SELECT 'ALL PROFILES' as table_name, id, email, role, approval_status, full_name
FROM profiles 
ORDER BY created_at DESC;

-- 4. If admin profile doesn't exist, create it manually
-- FIRST run query 1 to get the UUID, then run this with the actual UUID:
-- Replace 'YOUR_ACTUAL_ADMIN_UUID_HERE' with the UUID from query 1

INSERT INTO profiles (
  id, 
  email, 
  full_name, 
  company_name, 
  role, 
  approval_status,
  gst_number
) VALUES (
  'YOUR_ACTUAL_ADMIN_UUID_HERE', 
  'admin@textile-connect.com', 
  'Admin User', 
  'Textile Connect Admin', 
  'admin',
  'APPROVED',
  NULL
);

-- 5. Alternative: Create admin profile using dynamic approach (safer)
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
