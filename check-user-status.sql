-- Check Email and Approval Status for jeyavels758@gmail.com

SELECT 
  'User Status Check' as check_type,
  p.id,
  p.email,
  p.full_name,
  p.approval_status,
  u.email_confirmed_at,
  u.created_at as user_created_at,
  CASE 
    WHEN u.email_confirmed_at IS NULL AND p.approval_status = 'APPROVED' THEN '❌ Approved but email not confirmed - cannot login'
    WHEN u.email_confirmed_at IS NOT NULL AND p.approval_status = 'APPROVED' THEN '✅ Email confirmed and approved - can login'
    WHEN u.email_confirmed_at IS NULL AND p.approval_status != 'APPROVED' THEN '❌ Email not confirmed and not approved - cannot login'
    WHEN u.email_confirmed_at IS NOT NULL AND p.approval_status != 'APPROVED' THEN '❌ Email confirmed but not approved - cannot login'
    ELSE '❓ Unknown status'
  END as login_status,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email verified'
    ELSE '❌ Email not verified'
  END as email_status,
  CASE 
    WHEN p.approval_status = 'APPROVED' THEN '✅ Admin approved'
    ELSE '❌ Admin not approved'
  END as approval_status_text
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'jeyavels758@gmail.com';
