-- FIX: Update Buyer Counts to Exclude Rejected Users
-- This ensures REJECTED buyers don't count toward the total "buyers" count

-- Check current status before update
SELECT 
  'Current Breakdown - ALL Profiles' as check,
  COUNT(*) as total,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'buyer' THEN 1 END) as all_buyer_count,
  COUNT(CASE WHEN role = 'buyer' AND approval_status = 'PENDING' THEN 1 END) as pending_count,
  COUNT(CASE WHEN role = 'buyer' AND approval_status = 'APPROVED' THEN 1 END) as approved_count,
  COUNT(CASE WHEN role = 'buyer' AND approval_status = 'REJECTED' THEN 1 END) as rejected_count
FROM profiles;

-- Show breakdown by status
SELECT 
  'Buyer Breakdown by Status' as check,
  approval_status,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM profiles
WHERE role = 'buyer'
GROUP BY approval_status
ORDER BY approval_status DESC;

-- Show only ACTIVE buyers (PENDING + APPROVED, excludes REJECTED)
SELECT 
  'Active Buyers Count' as check,
  COUNT(*) as active_buyer_count
FROM profiles
WHERE role = 'buyer' 
AND approval_status IN ('PENDING', 'APPROVED');

-- Show all rejected buyers
SELECT 
  'Rejected Buyers (Should be 3)' as check,
  COUNT(*) as rejected_count
FROM profiles
WHERE role = 'buyer'
AND approval_status = 'REJECTED';
