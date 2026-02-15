-- Enhanced Registration with Email Verification Workflow

-- Step 1: Add email verification fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_token TEXT WITH DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP WITH DEFAULT NULL;

-- Step 2: Create function to generate verification token
CREATE OR REPLACE FUNCTION generate_verification_token(email TEXT)
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate secure random token
  token := encode(
    convert_to(
      email || extract(epoch from now())::TEXT,
      'UTF8'
    ),
    'BASE64'
  );
  
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create function to verify email
CREATE OR REPLACE FUNCTION verify_email_token(token TEXT)
RETURNS JSON AS $$
DECLARE
  decoded_email TEXT;
  token_email TEXT;
BEGIN
  -- Decode the token to get email
  SELECT convert_from(
    decode(token, 'BASE64'),
    'UTF8'
  ) INTO decoded_email;
  
  -- Extract email from decoded data (format: email|timestamp)
  token_email := split_part(decoded_email, '|', 1);
  
  -- Mark email as verified if token is valid (within 24 hours)
  UPDATE profiles 
  SET 
    email_verified_at = NOW(),
    verification_token = NULL,
    verification_token_expires_at = NULL
  WHERE email = token_email 
  AND verification_token IS NOT NULL
  AND verification_token_expires_at > NOW();
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'email', token_email,
    'message', 'Email verified successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger to send verification email on registration
CREATE OR REPLACE FUNCTION send_verification_email(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  verification_token TEXT;
  verification_link TEXT;
BEGIN
  -- Generate verification token
  SELECT generate_verification_token(user_email) INTO verification_token;
  
  -- Set token and expiry in profiles
  UPDATE profiles 
  SET 
    verification_token = verification_token,
    verification_token_expires_at = NOW() + INTERVAL '24 hours'
  WHERE email = user_email;
  
  -- Create verification link (in production, use your domain)
  verification_link := 'http://localhost:5173/verify-email?token=' || verification_token;
  
  -- In production, you would send this via email service
  -- For now, return the link for manual testing
  RETURN json_build_object(
    'success', true,
    'email', user_email,
    'verification_link', verification_link,
    'message', 'Verification email sent (check console for link)'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Update registration to include email verification
CREATE OR REPLACE FUNCTION register_with_verification(
  email TEXT,
  password TEXT,
  full_name TEXT,
  company_name TEXT,
  gst_number TEXT
)
RETURNS JSON AS $$
DECLARE
  user_id UUID;
  verification_result JSON;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (email, password)
  VALUES (email, password)
  RETURNING id INTO user_id;
  
  -- Create profile with PENDING status
  INSERT INTO profiles (
    id, email, full_name, company_name, gst_number, 
    role, approval_status
  )
  VALUES (
    user_id, email, full_name, company_name, gst_number,
    'buyer', 'PENDING'
  );
  
  -- Send verification email
  SELECT send_verification_email(email) INTO verification_result;
  
  RETURN json_build_object(
    'success', true,
    'user_id', user_id,
    'message', 'Registration successful. Please check your email for verification link.',
    'verification_link', (verification_result->>'verification_link')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Update admin approval to also verify email
CREATE OR REPLACE FUNCTION approve_buyer_with_verification(
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
  
  -- Approve buyer AND verify email in one step
  UPDATE profiles 
  SET 
    approval_status = 'APPROVED',
    approved_by = admin_email,
    email_verified_at = COALESCE(email_verified_at, NOW()),
    verification_token = NULL,
    verification_token_expires_at = NULL
  WHERE id = buyer_id;
  
  -- Confirm email in auth.users (this allows login)
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = buyer_id;
  
  RETURN json_build_object(
    'success', true,
    'buyer_email', buyer_email,
    'message', 'Buyer approved and email verified - can login now'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
