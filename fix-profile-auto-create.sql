-- ============================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
-- This trigger automatically creates a row in public.profiles
-- whenever a new user is created in auth.users.
-- It uses SECURITY DEFINER to bypass RLS.
-- ============================================

-- Step 1: Create the function (runs with elevated privileges)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name, gst_number, role, approval_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'gst_number', ''),
    'buyer',
    'PENDING'
  )
  ON CONFLICT (id) DO NOTHING;  -- Skip if profile already exists
  RETURN NEW;
END;
$$;

-- Step 2: Drop existing trigger if any, then create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Backfill - Create profiles for any existing auth users that don't have one yet
INSERT INTO public.profiles (id, email, full_name, company_name, gst_number, role, approval_status)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.raw_user_meta_data->>'company_name', ''),
  COALESCE(u.raw_user_meta_data->>'gst_number', ''),
  'buyer',
  'PENDING'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Step 4: Verify
SELECT 
  'Total auth users' as check_type,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Total profiles' as check_type,
  COUNT(*) as count
FROM public.profiles;
