-- Buyer Approval with Email Confirmation Workflow

-- Step 1: Update buyer approval and send confirmation email
-- This function/approach should be called when admin clicks "Approve" button

-- First, approve the buyer
UPDATE profiles 
SET 
  approval_status = 'APPROVED',
  approved_at = NOW()
WHERE id = $1 AND role = 'buyer';

-- Then, send confirmation email (this would be handled by your backend/email service)
-- For now, we'll manually confirm the email since we don't have email service
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE id = $1;

-- Step 2: Create a function to approve buyer with email confirmation
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
  
  -- Confirm email (in real app, this would send email)
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = buyer_id;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'buyer_email', buyer_email,
    'buyer_name', buyer_name,
    'message', 'Buyer approved and email confirmed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Test the function
-- This simulates approving buyer with ID 'your-buyer-uuid-here'
-- SELECT approve_buyer_and_confirm_email('your-buyer-uuid-here', 'admin@textile-connect.com');

-- Step 4: Create trigger to automatically confirm email when approved
CREATE OR REPLACE FUNCTION auto_confirm_buyer_email()
RETURNS TRIGGER AS $$
BEGIN
  -- When a buyer is approved, automatically confirm their email
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND NEW.approval_status = 'APPROVED';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger (optional - uncomment if you want automatic confirmation)
-- CREATE TRIGGER trigger_auto_confirm_buyer
-- AFTER UPDATE ON profiles
-- FOR EACH ROW
-- WHEN (NEW.approval_status = 'APPROVED' AND OLD.approval_status != 'APPROVED')
-- EXECUTE FUNCTION auto_confirm_buyer_email();

-- Step 6: View approved but unconfirmed buyers
SELECT 
  'Approved but Unconfirmed Buyers' as status,
  p.id,
  p.email,
  p.full_name,
  p.company_name,
  p.approved_at,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Can login'
    ELSE '❌ Needs email confirmation'
  END as login_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.approval_status = 'APPROVED'
AND u.email_confirmed_at IS NULL;
