-- Fix Approval Function - Don't Auto-Confirm Email

-- Step 1: Update approval function to NOT bypass email confirmation
CREATE OR REPLACE FUNCTION approve_buyer_simple(
  buyer_id UUID,
  admin_email TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  buyer_email TEXT;
  buyer_name TEXT;
  email_confirmed BOOLEAN;
BEGIN
  -- Get buyer details and check email confirmation status
  SELECT p.email, p.full_name, u.email_confirmed_at IS NOT NULL 
  INTO buyer_email, buyer_name, email_confirmed
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.id = buyer_id AND p.role = 'buyer';
  
  -- Approve buyer (DON'T confirm email automatically)
  UPDATE profiles 
  SET approval_status = 'APPROVED'
  WHERE id = buyer_id;
  
  -- Return appropriate message based on email confirmation
  IF email_confirmed THEN
    RETURN json_build_object(
      'success', true,
      'buyer_email', buyer_email,
      'message', 'Buyer approved and email verified - can login now'
    );
  ELSE
    RETURN json_build_object(
      'success', true,
      'buyer_email', buyer_email,
      'message', 'Buyer approved but email not verified - user must click confirmation email'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Test the function with your test buyer
SELECT approve_buyer_simple(
  (SELECT id FROM profiles WHERE email = 'test-manual@example.com' AND role = 'buyer'),
  'admin@textile-connect.com'
);

-- Step 3: Check current email confirmation status
SELECT 
  'Email Confirmation Status' as check_type,
  p.email,
  p.approval_status,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email not confirmed - cannot login'
    ELSE '✅ Email confirmed - can login if approved'
  END as login_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'test-manual@example.com';
