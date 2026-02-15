-- ============================================
-- AUTO-CONFIRM EMAIL WHEN ADMIN APPROVES BUYER
-- ============================================
-- This script creates a PostgreSQL function that auto-confirms email confirmation
-- when a buyer's approval_status is set to 'APPROVED'

-- Step 1: Create the function to update approval and confirm email
CREATE OR REPLACE FUNCTION update_approval_and_confirm_email(
  p_profile_id UUID,
  p_approval_status TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Update the profile approval status
  UPDATE profiles
  SET approval_status = p_approval_status
  WHERE id = p_profile_id;

  -- If approved, auto-confirm the email in auth.users
  IF p_approval_status = 'APPROVED' THEN
    UPDATE auth.users
    SET 
      email_confirmed_at = CURRENT_TIMESTAMP,
      last_sign_in_at = CASE 
        WHEN last_sign_in_at IS NULL THEN NULL 
        ELSE last_sign_in_at 
      END
    WHERE id = p_profile_id;
    
    RETURN QUERY SELECT true::boolean, 'Profile approved and email confirmed'::text;
  ELSE
    -- If rejected or pending, just update approval status
    RETURN QUERY SELECT true::boolean, format('Profile set to %s', p_approval_status)::text;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false::boolean, 'Error: ' || SQLERRM::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Grant permissions (if needed)
GRANT EXECUTE ON FUNCTION update_approval_and_confirm_email(UUID, TEXT) TO authenticated;

-- Step 3: Verify the function works
-- Test it with a sample user (replace with real profile_id):
-- SELECT * FROM update_approval_and_confirm_email('user-uuid-here', 'APPROVED');

-- ============================================
-- NOW ALSO UPDATE business.ts TO USE THIS
-- ============================================
-- Update the updateProfileApproval function to call this new function
-- See instructions below
