-- Quick Test: Check if Approved Buyer Exists in Database

-- Step 1: Check if your test buyer exists
SELECT 
  'Buyer Existence Check' as check_type,
  p.id,
  p.email,
  p.full_name,
  p.approval_status,
  u.email_confirmed_at,
  CASE 
    WHEN p.email = 'test-manual@example.com' THEN '✅ Test buyer found'
    ELSE '❌ Test buyer not found'
  END as existence_check
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'test-manual@example.com';

-- Step 2: Check all approved buyers
SELECT 
  'All Approved Buyers' as status,
  COUNT(*) as total_approved,
  STRING_AGG(p.email, ', ') as buyer_emails
FROM profiles p
WHERE p.approval_status = 'APPROVED'
AND p.role = 'buyer';

-- Step 3: Check what getAllProfiles should return
-- This simulates what the frontend should see
SELECT 
  'Expected Frontend Data' as check_type,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'buyer' THEN 1 END) as buyer_count,
  COUNT(CASE WHEN approval_status = 'APPROVED' THEN 1 END) as approved_count,
  COUNT(CASE WHEN approval_status = 'PENDING' THEN 1 END) as pending_count
FROM profiles;
