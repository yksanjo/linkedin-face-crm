import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage...\n');

  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Error listing buckets:', listError);
    return;
  }

  const bucketExists = buckets?.some(b => b.name === 'contact-faces');

  if (bucketExists) {
    console.log('✅ Bucket "contact-faces" already exists!');
  } else {
    console.log('📦 Creating bucket "contact-faces"...');

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('contact-faces', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      console.log('\n⚠️  You may need to create the bucket manually in Supabase Dashboard:');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Select your project');
      console.log('   3. Go to Storage');
      console.log('   4. Click "Create a new bucket"');
      console.log('   5. Name it "contact-faces"');
      console.log('   6. Make it PUBLIC');
      console.log('   7. Set max file size to 5MB');
      return;
    }

    console.log('✅ Bucket created successfully!');
  }

  console.log('\n✨ Storage setup complete!');
  console.log('You can now upload contact photos.\n');
}

setupStorage().catch(console.error);
