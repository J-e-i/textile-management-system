# Fix: 6 Registered Users Have No Profiles

## Problem Found
The diagnostic showed 6 auth users registered but have **no buyer profiles** in the database:
- jayasuryas.23aim@kongu.edu
- jeyavels43@gmail.com
- gangeswarajj.23aim@kongu.edu
- jeyavels7@gmail.com
- jeyavel2005@gmail.com
- jeyavels.23aim@kongu.edu

## Root Cause
The RLS policy for **INSERT** on profiles table is either missing or not working correctly during signup. The registration succeeds but profile creation fails silently (now with the fixed error message).

---

## Immediate Fix - 3 Steps

### STEP 1: Create Profiles for Existing Orphaned Users

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor** → **New Query**
2. Copy all of **`CREATE-MISSING-BUYER-PROFILES.sql`**
3. Paste and click **Run** ▶️

This will:
- ✅ Create buyer profiles for all 6 users
- ✅ Set them as PENDING for admin approval
- ✅ Recover their registration data from auth metadata

**Expected result:**
```
Total Profiles: 7
- 1 admin
- 6 buyers (PENDING)
```

### STEP 2: Verify and Fix INSERT Policy

1. **New Query** in SQL Editor
2. Copy all of **`VERIFY-INSERT-POLICY.sql`**
3. Paste and click **Run** ▶️

This will:
- ✅ Check if the INSERT policy exists
- ✅ Drop and recreate it properly
- ✅ Verify it's working

**The policy `profiles_user_can_insert_own` should exist with:**
```
Command: INSERT
WITH CHECK: auth.uid() = id
```

### STEP 3: Test Admin Dashboard

1. Log out and log back in as admin
2. Go to **Admin → Buyer Approvals**
3. You should now see **6 pending buyers** ✅

---

## For Future Registrations - Additional Fix

The issue was the INSERT policy might have been missing or incorrect. To prevent this for NEW registrations:

### Option A: Use Supabase Functions (Recommended)

Instead of having the client insert the profile, use a **Postgres trigger** to automatically create profiles when users sign up:

```sql
-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    company_name,
    gst_number,
    role,
    approval_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Company'),
    COALESCE(NEW.raw_user_meta_data->>'gst_number', ''),
    'buyer',
    'PENDING'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

This way:
- ✅ Profiles are created automatically by the database
- ✅ No need to rely on RLS policies for signup
- ✅ User data is never lost

### Option B: Simpler - Just Ensure INSERT Policy Works

Make sure the policy exists (which VERIFY-INSERT-POLICY.sql does), and it should work fine.

---

## Testing New Registration

**Before testing**, follow steps 1-2 above to fix existing users.

Then try a new registration with a different email:
- Email: `newtest@example.com`
- Full Name: `New Test`
- Company: `Test Corp`
- GST: `22AAAAA0000A1Z5`

Check browser console (F12):
- ✅ Should see: `Profile created successfully for: newtest@example.com`
- ❌ Should NOT see: `Profile creation error`

---

## If Profiles Still Don't Get Created

1. Check the error in browser console (F12)
2. Run DIAGNOSTIC-CHECK.sql again
3. The error will tell you exactly what's blocking the INSERT

Common errors:
- `permission denied` = RLS policy blocking
- `duplicate key` = Profile already exists (shouldn't happen)
- `column does not exist` = Schema mismatch

---

## What Changed

**Before (Silent Failure):**
```
User registers → Auth created ✅
Profile insert fails ❌
User sees "success" but no profile exists ❌
```

**After (Visible Error):**
```
User registers → Auth created ✅
Profile insert fails ❌
User sees error message ✅
You know exactly what went wrong ✅
```

---

## Summary

1. ✅ Run `CREATE-MISSING-BUYER-PROFILES.sql` → Creates 6 buyer profiles
2. ✅ Run `VERIFY-INSERT-POLICY.sql` → Ensures INSERT policy works
3. ✅ Log in as admin → See 6 pending buyers in approval list
4. ✅ Future registrations → Will work correctly with proper error handling
