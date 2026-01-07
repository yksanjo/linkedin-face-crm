# Supabase Storage Setup Guide

## Create the Storage Bucket (2 minutes)

Your app needs a storage bucket called `contact-faces` to save photos. Follow these steps:

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Login if needed
3. Select your project: **jyixgalqejdandnrmnqe**

### Step 2: Navigate to Storage
1. In the left sidebar, click **Storage**
2. Click the **"New bucket"** or **"Create a new bucket"** button

### Step 3: Create the Bucket
Fill in the following settings:

- **Name:** `contact-faces` (exactly this name, lowercase, with hyphen)
- **Public bucket:** ✅ **ENABLED** (toggle this ON - very important!)
- **File size limit:** `5 MB` (5242880 bytes)
- **Allowed MIME types:** `image/jpeg, image/jpg, image/png, image/webp`

### Step 4: Click "Create bucket"

That's it! The bucket is now ready.

### Step 5: Verify
1. Go back to Storage in the Supabase dashboard
2. You should see a bucket named `contact-faces`
3. It should show as **Public**

## What This Does

- **Stores contact photos** - When you upload or capture a photo, it's saved here
- **Makes photos accessible** - Public bucket means photos can be viewed in your app
- **Limits file size** - Prevents users from uploading huge files
- **Allows only images** - Only image files (jpg, png, webp) can be uploaded

## Troubleshooting

### Can't find the "New bucket" button?
- Make sure you're in the **Storage** section (left sidebar)
- You might need to scroll down

### Bucket creation fails?
- Check that you're the owner/admin of the Supabase project
- Make sure the name is exactly `contact-faces` (lowercase, with hyphen)

### Still having issues?
The bucket might already exist! Check if you see `contact-faces` in your bucket list.

---

**Need help?** Open a GitHub issue at https://github.com/yksanjo/linkedin-face-crm/issues
