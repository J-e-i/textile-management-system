-- Automatic Email Confirmation Trigger for Approved Buyers

-- Step 1: Create trigger to automatically confirm email when buyer is approved
CREATE OR REPLACE FUNCTION auto_confirm_approved_buyer()
RETURNS TRIGGER AS $$
BEGIN
  -- When a buyer is approved, automatically confirm their email
  IF NEW.approval_status = 'APPROVED' AND OLD.approval_status != 'APPROVED' THEN
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger on profiles table
DROP TRIGGER IF EXISTS trigger_auto_confirm_approved_buyer;
CREATE TRIGGER trigger_auto_confirm_approved_buyer
AFTER UPDATE ON profiles
FOR EACH ROW
WHEN (NEW.approval_status = 'APPROVED' AND OLD.approval_status != 'APPROVED')
EXECUTE FUNCTION auto_confirm_approved_buyer();

-- Step 3: Test the trigger
-- This simulates approving a new buyer
UPDATE profiles 
SET 
  approval_status = 'APPROVED',
  approved_at = NOW()
WHERE email = 'test-new-buyer@example.com' AND role = 'buyer';

-- Step 4: Verify the trigger worked
SELECT 
  'Trigger Test Result' as check_type,
  p.email,
  p.approval_status,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '❌ Trigger did not work'
    ELSE '✅ Trigger worked - email confirmed'
  END as trigger_result
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'test-new-buyer@example.com';

-- Step 5: Manual confirmation for existing approved buyers
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE id IN (
  SELECT p.id 
  FROM profiles p 
  WHERE p.approval_status = 'APPROVED'
  AND p.email != 'test-new-buyer@example.com'
);
