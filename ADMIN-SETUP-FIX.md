# Admin Dashboard Data Loading Fix

## Problem
Admin pages (Buyer Approval, Orders, Quotations) show "failed to load data" and no new registrations appear for approval.

## Root Cause
The RLS (Row Level Security) policies in Supabase are too restrictive and prevent the admin user from accessing data due to:
1. Complex RLS policies with profile lookups that fail
2. Admin user profile might not exist or lack proper role assignment
3. Circular permission checks causing policy failures

## Solution Steps

### Step 1: Fix RLS Policies
1. Go to your **Supabase Dashboard** > **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of: `ADMIN-RLS-FIX.sql`
4. Click **Run**
5. Wait for the query to complete successfully

### Step 2: Ensure Admin Profile Exists  
1. Go to **Supabase Dashboard** > **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of: `SETUP-ADMIN-PROFILE.sql`
4. Click **Run**
5. Check the results to verify admin profile was created/updated

### Step 3: Clear Cache and Re-Login
1. **Clear your browser cache** completely (or use private/incognito window)
2. **Log out** from the application
3. **Log back in** with your admin credentials
   - Email: `admin@textile-connect.com`
   - Password: (your admin password)
4. Navigate to Admin > Buyer Approvals

### Step 4: Verify It Works
You should now see:
- ✅ Pending buyer registrations ready for approval
- ✅ All orders loading successfully  
- ✅ All quotations loading successfully

## If Still Having Issues

### Check Console Errors
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for error messages that include:
   - `Failed to fetch profiles`
   - `Failed to fetch orders`
   - `RLS policy`
   - `permission denied`

### Verify Admin User ID
1. Go to **Supabase Dashboard** > **Authentication** > **Users**
2. Find your admin user (email: admin@textile-connect.com)
3. Copy the USER ID
4. Go to **SQL Editor**
5. Run this query:
```sql
SELECT * FROM profiles WHERE id = 'PASTE_USER_ID_HERE';
```
6. Verify the result shows:
   - `role: 'admin'`
   - `approval_status: 'APPROVED'`

### Reset Data (Complete Fresh Start)
If data is corrupted, run this to clear everything:
```sql
-- CAUTION: This deletes all data!
DELETE FROM invoices;
DELETE FROM payments;
DELETE FROM quotation;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM profiles;

-- Then run SETUP-ADMIN-PROFILE.sql again
```

## What Was Fixed
- ✅ Simplified RLS policies that don't cause circular dependencies
- ✅ Added proper admin access controls
- ✅ Better error logging for debugging
- ✅ Support for multi-user access (admin + buyers)

## Testing Checklist
- [ ] Can view pending buyer approvals
- [ ] Can approve/reject buyers
- [ ] Can view all orders
- [ ] Can update order status
- [ ] Can create quotations
- [ ] Buyers can only see their own data
