-- Final Working Solution - Simple Buyer Approval with Email Confirmation

-- Step 1: Create a simple function to approve buyer and confirm email
CREATE OR REPLACE FUNCTION approve_buyer_and_confirm_email(
  buyer_id UUID,
  admin_email TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  buyer_email TEXT;
  buyer_name TEXT;
BEGIN
  -- Get buyer details
  SELECT p.email, p.full_name INTO buyer_email, buyer_name
  FROM profiles p
  WHERE p.id = buyer_id AND p.role = 'buyer';
  
  -- Approve the buyer
  UPDATE profiles 
  SET 
    approval_status = 'APPROVED',
    approved_at = NOW(),
    approved_by = admin_email
  WHERE id = buyer_id;
  
  -- Confirm email (this works immediately)
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = buyer_id;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'buyer_email', buyer_email,
    'buyer_name', buyer_name,
    'message', 'Buyer approved and email confirmed - can login now'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Test the function
SELECT approve_buyer_and_confirm_email(
  (SELECT id FROM profiles WHERE email = 'test-manual@example.com' AND role = 'buyer'),
  'admin@textile-connect.com'
);

-- Step 3: Manual confirmation for any existing approved buyers
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE id IN (
  SELECT p.id 
  FROM profiles p 
  WHERE p.approval_status = 'APPROVED' 
  AND p.role = 'buyer'
  AND p.email != 'test-manual@example.com'
);

-- Step 4: Verify everything worked
SELECT 
  'Final Status Check' as status,
  p.id,
  p.email,
  p.approval_status,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '❌ Still not confirmed'
    ELSE '✅ Confirmed and can login'
  END as final_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'buyer' 
AND p.approval_status = 'APPROVED';
