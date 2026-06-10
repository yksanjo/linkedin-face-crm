# Supabase Setup Guide

Follow these steps to complete your Supabase integration:

## ✅ Step 1: Run Database Schema

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase-setup.sql` and paste it
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: "Success. No rows returned"

## ✅ Step 2: Create Storage Bucket

1. In Supabase Dashboard, click **Storage** in the left sidebar
2. Click **New bucket**
3. Enter name: `contact-faces`
4. **Make it PUBLIC** ✓
5. Click **Create bucket**

### Configure Bucket Policies

1. Click on the `contact-faces` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Select **Full customization**
5. Policy name: `Public Access`
6. Policy definition:

   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR ALL
   USING (bucket_id = 'contact-faces');
   ```

7. Click **Review** then **Save policy**

### Set File Restrictions

1. Go to **Configuration** tab of the bucket
2. Set **Max file size**: 5 MB
3. Allowed MIME types: `image/jpeg, image/png`
4. Click **Save**

## ✅ Step 3: Test Locally

```bash
npm run dev
```

Open <http://localhost:3000> and try:

1. Enrolling a new contact
2. Viewing contacts
3. Recognizing faces

## ✅ Step 4: Deploy to Vercel

### Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `linkedin-face-crm` project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

   ```text
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: <your Supabase project URL>

   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: <your Supabase anon key, from Settings → API>
   ```

5. Click **Save** for each

### Deploy

```bash
git push
```

Vercel will automatically deploy with the new environment variables!

## 🎉 Done

Your app now has:

- ✅ Cloud database (PostgreSQL)
- ✅ Image storage (Supabase Storage)
- ✅ Unlimited contacts (up to 500MB)
- ✅ Multi-device sync
- ✅ Secure backups
- ✅ Still FREE!

## Troubleshooting

### "Failed to save contact"

- Check that storage bucket `contact-faces` is created and PUBLIC
- Verify bucket policies allow uploads
- Check browser console for errors

### "No contacts showing"

- Verify SQL schema ran successfully
- Check browser console for errors
- Try refreshing the page

### Images not loading

- Ensure bucket is PUBLIC
- Check that images were uploaded to Storage
- Verify image URLs in database

### Database connection errors

- Verify environment variables in Vercel
- Check that `.env.local` has correct values
- Restart dev server after env changes

## Need Help?

Check your Supabase logs:

1. Go to Supabase Dashboard
2. Click **Logs** → **Database** or **Storage**
3. Look for error messages
