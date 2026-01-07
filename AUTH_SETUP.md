# Authentication Setup Guide

## Step 1: Run Database Migration (Required - 2 minutes)

To enable authentication and user-specific data isolation, you need to run a SQL migration in Supabase.

### Instructions:

1. **Go to Supabase SQL Editor**
   - Open: https://supabase.com/dashboard/project/jyixgalqejdandnrmnqe/sql/new
   - Or navigate: Supabase Dashboard → Your Project → SQL Editor → New query

2. **Copy the Migration SQL**
   - Open the file `supabase-auth-migration.sql` in this project
   - Select all and copy (Cmd+A, Cmd+C)

3. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click **"Run"** button (or press Cmd+Enter)

4. **Verify Success**
   - You should see "Success. No rows returned" message
   - Go to Database → Tables → contacts
   - Verify `user_id` column exists

### What This Migration Does:

- ✅ Adds `user_id` column to `contacts` table
- ✅ Creates Row Level Security (RLS) policies
- ✅ Ensures users can only see their own contacts
- ✅ Prevents users from seeing other users' data

## Step 2: Test Authentication (5 minutes)

After running the migration:

### A. Create an Account

1. Go to your app: http://localhost:3001 (or production URL)
2. Click **"Sign Up"** in the top right
3. Enter:
   - Email: your@email.com
   - Password: (minimum 6 characters)
   - Confirm Password: (same password)
4. Click **"Create Account"**
5. You'll be automatically logged in and redirected to the homepage

### B. Enroll a Contact

1. Click **"Enroll Contact"**
2. Capture or upload a photo
3. Fill in contact details
4. Click **"Save Contact"**
5. ✅ Contact should save successfully!

### C. View Your Contacts

1. Click **"Manage Contacts"**
2. You should see the contact you just added
3. ✅ Only YOUR contacts are visible!

### D. Test Logout

1. Click **"Logout"** in the top right
2. You'll be redirected to the login page
3. ✅ You can no longer access contacts without logging in

### E. Test Login

1. Click **"Login"**
2. Enter your email and password
3. Click **"Sign In"**
4. ✅ You're back in and can see your contacts!

## Step 3: Test Multi-User Isolation

To verify users can't see each other's data:

### A. Create a Second Account

1. Logout from your first account
2. Click **"Sign Up"**
3. Create a new account with a different email
4. Enroll a different contact

### B. Verify Isolation

1. Logout and login to your first account
2. Go to "Manage Contacts"
3. ✅ You should ONLY see contacts from your first account
4. ✅ The second account's contacts are NOT visible!

## Troubleshooting

### Migration Fails

**Error: "column 'user_id' already exists"**
- ✅ This is fine! It means the migration already ran
- Proceed to Step 2

**Error: "permission denied"**
- Make sure you're the project owner
- Use the service role key if needed

### Can't Save Contacts

**Error: "new row violates row-level security policy"**
- Make sure you ran the migration
- Make sure you're logged in
- Check that RLS policies were created

### All Contacts Gone

**My contacts disappeared after migration!**
- Old contacts don't have a `user_id` and can't be accessed
- This is expected if you enrolled contacts before authentication
- Create new contacts after logging in

## Security Notes

### What's Protected:

- ✅ **Contacts** - Each user only sees their own
- ✅ **Photos** - Images in storage are public, but contact associations are private
- ✅ **Interactions** - Only visible for user's own contacts

### What's NOT Protected (Yet):

- ⚠️ **Storage bucket** - Images are publicly accessible if you know the URL
  - This is fine for most use cases
  - For higher security, you can make the bucket private and add RLS

### Best Practices:

1. **Use strong passwords** (minimum 6 characters, but longer is better)
2. **Don't share your account** - Each user should have their own
3. **Logout when done** - Especially on shared devices
4. **Test in production** - Make sure RLS policies work on Vercel too

## Next Steps

Once authentication is working:

1. ✅ Each user has their own private network
2. ✅ Data is completely isolated between users
3. ✅ You can invite team members to create their own accounts
4. ✅ Consider adding features like:
   - Password reset
   - Email verification
   - Profile settings
   - Team/organization features

---

**Need help?** Open an issue at https://github.com/yksanjo/linkedin-face-crm/issues
