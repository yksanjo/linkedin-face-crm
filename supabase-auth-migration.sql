-- LinkedIn Face Recognition CRM - Authentication Migration
-- Run this in your Supabase SQL Editor to add user authentication

-- Add user_id column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);

-- Update RLS policies to filter by user
DROP POLICY IF EXISTS "Allow all operations on contacts" ON contacts;

-- Allow users to see only their own contacts
CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own contacts
CREATE POLICY "Users can insert own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own contacts
CREATE POLICY "Users can update own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own contacts
CREATE POLICY "Users can delete own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Update interactions table policies (optional, for future use)
DROP POLICY IF EXISTS "Allow all operations on interactions" ON interactions;

-- Allow users to see only interactions for their own contacts
CREATE POLICY "Users can view own interactions" ON interactions
  FOR SELECT USING (
    contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid())
  );

-- Allow users to insert interactions for their own contacts
CREATE POLICY "Users can insert own interactions" ON interactions
  FOR INSERT WITH CHECK (
    contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid())
  );

-- Allow users to update interactions for their own contacts
CREATE POLICY "Users can update own interactions" ON interactions
  FOR UPDATE USING (
    contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid())
  );

-- Allow users to delete interactions for their own contacts
CREATE POLICY "Users can delete own interactions" ON interactions
  FOR DELETE USING (
    contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid())
  );

-- Note: After running this SQL, you need to:
-- 1. Update your app to include user_id when creating contacts
-- 2. Make sure users are authenticated before accessing protected routes
-- 3. Test that users can only see their own contacts
