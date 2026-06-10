# 🔧 FIX LOGIN REDIRECT ISSUE

## The Problem

Your magic link is redirecting to the wrong URL:

- ❌ Trying to go to: `http://localhost:3000`
- ✅ Should go to: `http://localhost:3001` (your actual app)

This causes the login to fail!

---

## SOLUTION 1: Update Redirect URL (2 minutes)

### Step 1: Go to Supabase Auth Settings

Click this link:

```text
https://supabase.com/dashboard/project/jyixgalqejdandnrmnqe/auth/url-configuration
```

Or navigate:

- Supabase Dashboard
- Authentication
- URL Configuration

### Step 2: Update Site URL

Find the field: **Site URL**

Change from:

```text
http://localhost:3000
```

To:

```text
http://localhost:3001
```

### Step 3: Add Redirect URLs

Scroll down to **Redirect URLs**

Make sure these are in the list:

```text
http://localhost:3001/**
http://localhost:3001/auth/callback
https://*.vercel.app/**
```

Click **"Save"**

---

## SOLUTION 2: Use Password Login Instead (Recommended)

You don't need magic links! Just use email/password:

### Step 1: Go to Login Page

```text
http://localhost:3001/login
```

### Step 2: Enter Your Credentials

- Email: (your email)
- Password: (your password)

### Step 3: Click "Sign In"

✅ You should be logged in!

---

## If You Forgot Your Password

### Option A: Reset via Script

Run this command:

```bash
node scripts/reset-user-password.js
```

Enter a new password, then login with it.

### Option B: Create New Account

1. Go to: <http://localhost:3001/signup>
2. Use a different email
3. Create new account
4. You'll be logged in automatically

---

## Quick Fix: Change App to Port 3000

If you want to keep using port 3000, change your dev server:

### Edit package.json

```json
"scripts": {
  "dev": "next dev -p 3000",
  ...
}
```

Then restart:

```bash
npm run dev
```

---

## For Production (Vercel)

Also add your production URL to Redirect URLs:

1. Go to: <https://supabase.com/dashboard/project/jyixgalqejdandnrmnqe/auth/url-configuration>

2. Add these to Redirect URLs:

   ```text
   https://linkedin-face-nv8hgmxqr-yoshi-kondos-projects.vercel.app/**
   https://*.vercel.app/**
   ```

3. Update Site URL to your production URL:

   ```text
   https://linkedin-face-nv8hgmxqr-yoshi-kondos-projects.vercel.app
   ```

---

## Test After Fixing

1. ✅ Update redirect URLs in Supabase
2. ✅ Go to: <http://localhost:3001/login>
3. ✅ Enter email and password
4. ✅ Click "Sign In"
5. ✅ Should work now!

---

**Still stuck?** Run this diagnostic:

```bash
node scripts/test-login.js
```

Then tell me what error you see!
