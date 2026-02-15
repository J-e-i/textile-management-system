-- Check EXACT schema first
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Simple solution that works with ANY schema
CREATE OR REPLACE FUNCTION approve_buyer_simple(
  buyer_id UUID,
  admin_email TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  buyer_email TEXT;
  buyer_name TEXT;
BEGIN
  -- Get buyer details (only need email for login)
  SELECT p.email, p.full_name INTO buyer_email, buyer_name
  FROM profiles p
  WHERE p.id = buyer_id AND p.role = 'buyer';
  
  -- Approve the buyer (only change status)
  UPDATE profiles 
  SET 
    approval_status = 'APPROVED'
  WHERE id = buyer_id;
  
  -- Confirm email in auth.users (this allows login)
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = buyer_id;
  
  RETURN json_build_object(
    'success', true,
    'buyer_email', buyer_email,
    'message', 'Buyer approved - can login now'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT approve_buyer_simple(
  (SELECT id FROM profiles WHERE email = 'test-manual@example.com' AND role = 'buyer'),
  'admin@textile-connect.com'
);
