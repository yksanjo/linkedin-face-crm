-- LinkedIn Face Recognition CRM - Supabase Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  title TEXT,
  linkedin_url TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  tags TEXT[],
  face_descriptor FLOAT8[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ
);

-- Create interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  location TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on contacts" ON contacts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on interactions" ON interactions
  FOR ALL USING (true) WITH CHECK (true);

-- Note: After running this SQL, you need to:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket called "contact-faces"
-- 3. Make it PUBLIC
-- 4. Set max file size to 5MB
-- 5. Allow image/jpeg and image/png file types
