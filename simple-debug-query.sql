-- Simple Debug Query - No Aggregate Functions

-- Check if there's a status field issue
SELECT 
  'Filtering Debug' as check_type,
  p.id,
  p.email,
  p.approval_status,
  p.role,
  CASE 
    WHEN p.approval_status IS NULL THEN '❌ No status set'
    WHEN p.role IS NULL THEN '❌ No role set'
    ELSE '✅ Has role and status'
  END as data_check
FROM profiles p
WHERE p.email = 'test-manual@example.com';

-- Check if the buyer actually exists
SELECT 
  'Buyer Existence' as check_type,
  COUNT(*) as buyer_count,
  p.email as buyer_email,
  p.approval_status,
  p.role
FROM profiles p
WHERE p.email = 'test-manual@example.com';
