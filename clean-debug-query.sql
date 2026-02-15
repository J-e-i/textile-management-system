-- Clean Debug Query - Fresh Start

-- Test 1: Check if your approved buyer exists and has correct data
SELECT 
  'Test Buyer Check' as result,
  p.id,
  p.email,
  p.approval_status,
  p.role,
  CASE 
    WHEN p.approval_status = 'APPROVED' AND p.role = 'buyer' THEN '✅ Approved buyer found'
    ELSE '❌ Buyer not found or wrong status'
  END as status
FROM profiles p
WHERE p.email = 'test-manual@example.com';

-- Test 2: Check what getAllProfiles should return for this buyer
SELECT 
  'Expected Frontend Data' as result,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'buyer' AND approval_status = 'APPROVED' THEN 1 END) as approved_buyers,
  COUNT(CASE WHEN role = 'buyer' AND approval_status = 'PENDING' THEN 1 END) as pending_buyers
FROM profiles;
