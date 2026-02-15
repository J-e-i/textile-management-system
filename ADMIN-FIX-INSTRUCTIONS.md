# Fix Admin Dashboard Data Fetching - Complete Guide

## Problem
✗ Admin pages show "Failed to load data"  
✗ Registrations work but admin can't see pending buyer approvals  
✗ Orders, Quotations, etc. show empty or error state

## Root Cause
**RLS Policies** (Row Level Security) are preventing the admin user from accessing database tables. The database is blocking admin queries due to permission policies.

---

## Solution - 2 Simple Steps

### STEP 1: Run the RLS Fix SQL Script

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of **`FIX-ADMIN-RLS-NOW.sql`** file
5. Paste it into the SQL editor
6. Click **Run** button (▶️)
7. Wait for it to complete (you'll see ✓ checkmarks for each statement)

**What this does:**
- Removes conflicting RLS policies
- Creates new policies that allow admins to access all data
- Keeps security for regular buyers (they only see their own data)

---

### STEP 2: Ensure Your Admin Profile Exists

1. Still in SQL Editor, click **New Query** again
2. Copy the entire contents of **`SETUP-ADMIN-PROFILE.sql`** file
3. Paste it into the SQL editor
4. Click **Run**

**What this does:**
- Makes sure your admin user has `role = 'admin'` in the database
- Sets status to `APPROVED` so admin can access everything

---

### STEP 3: Test It

1. **Clear browser cache** or use **Incognito/Private window**
2. **Log out** of the application
3. **Log back in** as admin with your credentials
4. Go to **Admin Dashboard**
5. Click **Buyer Approvals** - you should now see pending registrations ✅

---

## Verify Everything Works

### Check Box 1: Can See Pending Buyers?
- [ ] Go to Admin > Buyer Approvals
- [ ] You should see all buyers with status = "PENDING"
- [ ] Option to Approve or Reject

### Check Box 2: Can See Orders?
- [ ] Go to Admin > Orders
- [ ] You should see all buyer orders
- [ ] Can update order status

### Check Box 3: Can Create Quotations?
- [ ] Go to Admin > Quotations
- [ ] Can see pending orders
- [ ] Can create and send quotations

### Check Box 4: Buyer Data Access Still Secure?
- [ ] Log out, log in as a buyer
- [ ] Buyer can only see **their own orders**
- [ ] Buyer cannot see other buyers' data

---

## If Still Not Working

### Check Browser Console for Errors
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Look for messages that say:
   - `Failed to fetch profiles`
   - `Failed to fetch orders`
   - `RLS policy`
   - Any error starting with `failed`

### Verify Admin Profile Exists
Run this query in Supabase SQL Editor:

```sql
SELECT id, email, role, approval_status 
FROM profiles 
WHERE role = 'admin';
```

You should see **at least 1 row** with your admin email and `role='admin'`.

If nothing shows up, you need to create the admin profile manually:

```sql
-- Find your admin user ID first
SELECT id, email FROM auth.users WHERE email = 'admin@textile-connect.com';

-- Then update or create the profile (replace ADMIN_ID with the ID from above)
INSERT INTO profiles (id, email, full_name, company_name, role, approval_status)
VALUES (
  'PASTE_ADMIN_ID_HERE',
  'admin@textile-connect.com',
  'Admin',
  'Textile Connect',
  'admin',
  'APPROVED'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  approval_status = 'APPROVED';
```

### Force Logout & Re-Login
Sometimes the app caches old session data:

```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

Then log in again.

---

## How RLS Works (Quick Explanation)

**RLS = Row Level Security** - Database-level access control.

Before fix:
- ❌ Admin queries blocked by overly restrictive policies
- ❌ Policies tried to check admin role but failed
- ❌ Nothing loads

After fix:
- ✅ Admin can view all profiles/orders/quotations
- ✅ Admin can create/update quotations and handle approvals
- ✅ Buyers can only see their own data
- ✅ Policies are simple and reliable

---

## File Summary

- **`FIX-ADMIN-RLS-NOW.sql`** - Main RLS policy fix (run FIRST)
- **`SETUP-ADMIN-PROFILE.sql`** - Ensures admin profile exists (run SECOND)
- **`ADMIN-RLS-FIX.sql`** - Alternative version with more detail

---

## Still Having Issues?

1. ✓ Did you run BOTH SQL files?
2. ✓ Did they complete without errors?
3. ✓ Did you clear browser cache?
4. ✓ Did you log out and back in?
5. ✓ Opens browser DevTools (F12) - any red errors in Console?

If yes to all, contact support with the error message from step 5.
