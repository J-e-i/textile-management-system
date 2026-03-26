-- Function to delete a buyer completely from both auth.users and profiles
-- This must be SECURITY DEFINER to have permission to delete from auth.users
CREATE OR REPLACE FUNCTION delete_buyer_completely(buyer_id UUID)
RETURNS JSON AS $$
DECLARE
  buyer_email TEXT;
BEGIN
  -- Get email for logging/feedback
  SELECT email INTO buyer_email FROM public.profiles WHERE id = buyer_id;
  
  -- Delete from auth.users
  -- This will cascade to profiles if the foreign key is set to ON DELETE CASCADE
  DELETE FROM auth.users WHERE id = buyer_id;
  
  -- Ensure it's deleted from profiles even if cascade didn't happen
  DELETE FROM public.profiles WHERE id = buyer_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Buyer ' || COALESCE(buyer_email, buyer_id::text) || ' removed completely from system'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
