## Fix for "Email Not Confirmed" Error on Approved Buyer Login

### The Problem
Even though approval status updates correctly in the database, Supabase's authentication layer requires **email confirmation** before allowing login. We needed to auto-confirm emails when the admin approves a buyer.

### The Solution
**2 Steps:**

#### Step 1: Run SQL in Supabase (One-Time Setup)

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of **`AUTO-CONFIRM-EMAIL-ON-APPROVAL.sql`**
5. Paste it in the query editor
6. Click **Run**

This creates a PostgreSQL function that will:
- Update approval_status in the profiles table
- Auto-confirm the email in auth.users table when approval = 'APPROVED'

#### Step 2: Code Update (Already Done ✅)

The `updateProfileApproval` function in `src/lib/business.ts` has been updated to:
- Call the new PostgreSQL function via `supabase.rpc()`
- When admin clicks "Approve", it now:
  1. Updates approval_status to APPROVED
  2. Auto-confirms the email automatically

### Testing

1. **Approve a Buyer:**
   - Login as admin
   - Go to Admin → Buyer Approvals
   - Click "Approve" on a pending buyer

2. **Test Login:**
   - Logout
   - Try logging in with that buyer's email
   - Should see: ✅ Successful login (no "Email not confirmed" error)

3. **Verify in Supabase:**
   - Go to `auth.email_confirmations` table
   - The approved buyer should now have an `email_confirmed_at` timestamp

### How It Works (Technical Details)

```sql
-- When admin approves a buyer, this runs:
UPDATE auth.users
SET email_confirmed_at = CURRENT_TIMESTAMP
WHERE id = profile_id;
```

This marks the email as confirmed in Supabase's auth system, allowing the buyer to login with `signInWithPassword()` without the "Email not confirmed" error.

### Rollback (If Needed)

If you need to manually un-confirm or re-confirm emails:

```sql
-- Un-confirm (block login)
UPDATE auth.users
SET email_confirmed_at = NULL
WHERE id = 'user-uuid-here';

-- Confirm (allow login)
UPDATE auth.users
SET email_confirmed_at = CURRENT_TIMESTAMP
WHERE id = 'user-uuid-here';
```

### Summary

- ✅ SQL function created to auto-confirm emails
- ✅ Code updated to use the new function
- ✅ Approved buyers can now login
- ✅ Email confirmation happens automatically with approval

**Next: Run the SQL script in Supabase, then test approved buyer login!**
