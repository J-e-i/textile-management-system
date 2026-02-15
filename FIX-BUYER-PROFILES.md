# Fix: Registrations Not Creating Buyer Profiles

## Problem
- ✗ Registrations say "waiting for admin approval"
- ✗ But NO buyer profiles in database
- ✗ Only admin profile exists
- ✗ No pending approvals to show

## Root Cause
The buyer profile creation is **failing silently** due to RLS (Row Level Security) policy issues, but the user sees "success" anyway.

---

## Solution - 4 Steps

### STEP 1: Make Sure RLS Policies Are Applied

Run **`FIX-ADMIN-RLS-NOW.sql`** if you haven't already:

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** → **New Query**
3. Copy all of `FIX-ADMIN-RLS-NOW.sql`
4. Paste and click **Run** ▶️

This creates the proper RLS policies that allow:
- ✅ Users to insert their own profiles
- ✅ Admins to access all data
- ✅ Buyers to see only their own data

### STEP 2: Verify RLS Policies Exist

Run the diagnostic query to confirm policies are in place:

1. New Query in SQL Editor
2. Copy all of `DIAGNOSTIC-CHECK.sql`
3. Paste and click **Run** ▶️

**Look for these results:**

✅ **RLS Status** - Should show `rowsecurity = true`

✅ **Policies on profiles** - Should include:
- `profiles_user_can_insert_own`
- `profiles_user_can_update_own`
- `profiles_anyone_can_view`

✅ **Total Profiles** - After you test a registration, should show:
- admin_count: 1
- buyer_count: 1 (or more if you tested multiple)
- pending_count: 1 (or more)

### STEP 3: Test a New Registration

1. Go to the app at `http://localhost:8080`
2. Click **Register**
3. Fill in the form with:
   - Business Name: `Test Company`
   - GST Number: `22AAAAA0000A1Z5` (this is a valid test format)
   - Contact Person: `Test Person`
   - Email: `testbuyer1@example.com` (must be a NEW email)
   - Phone: `+91 9876543210`
   - Password: `TestPassword123`
4. Click **Submit Registration**

**Should see:** "Your account has been created and is pending admin approval"

### STEP 4: Check If Profile Was Created

1. Open browser **DevTools** (Press F12)
2. Go to **Console** tab
3. You should see logs like:
   - `Creating profile for user: [user-id]`
   - `Profile created successfully for: testbuyer1@example.com`

OR if it FAILED, you'll see:
- `Profile creation error: [error message]`

**If you see an error:**
- Copy the error message
- The error will now show to the user (it used to be hidden)
- This helps identify the actual problem

---

## Verify All Profiles Now Exist

After creating a test buyer profile:

1. SQL Editor → **New Query**
2. Run:
```sql
SELECT email, role, approval_status, created_at 
FROM profiles 
ORDER BY created_at DESC;
```

**You should see:**
```
admin@textile-connect.com       | admin  | APPROVED | [older date]
testbuyer1@example.com          | buyer  | PENDING  | [just now]
```

---

## Admin Should Now See Pending Buyers

1. Log out
2. Log back in as admin
3. Go to **Admin → Buyer Approvals**
4. You should see `testbuyer1@example.com` with status "PENDING"
5. Options to Approve or Reject

---

## Troubleshooting

### If Still No Buyer Profile After Registration

**Possibility 1: RLS Policy Not Applied**
- Run `FIX-ADMIN-RLS-NOW.sql` again
- Verify with `DIAGNOSTIC-CHECK.sql` that policies exist

**Possibility 2: RLS Policy Wrong**
- Check that `profiles_user_can_insert_own` exists
- It should have `CHECK (auth.uid() = id)`
- The new error messages will tell you what's wrong

**Possibility 3: Profile Table Issue**
- Run this query:
```sql
-- Check if profiles table exists and has right columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

Should have columns: `id`, `email`, `full_name`, `company_name`, `gst_number`, `role`, `approval_status`, `created_at`

### If You See Errors in Console

Take note of the exact error message:
- "permission denied" = RLS blocking
- "duplicate key" = Profile already exists
- "column does not exist" = Database schema issue
- "relation does not exist" = profiles table doesn't exist

---

## What Changed

Previously:
```typescript
if (profileError) {
  console.error('Profile creation error:', profileError);
  // Silently swallowed - user had no idea it failed!
}
```

Now:
```typescript
if (profileError) {
  throw new Error(`Failed to create buyer profile: ${profileError.message}`);
  // User sees the real error!
}
```

This way, if something is blocking profile creation, the user and you will know immediately.

---

## Next Steps

Once buyers are showing up in the database:

1. ✅ Test approval workflow - Admin approves a buyer
2. ✅ Test that approved buyers can log in and see buyer dashboard
3. ✅ Test that buyers can place orders
4. ✅ Test that admin can see all orders
