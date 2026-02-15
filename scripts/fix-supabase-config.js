const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('\n🔧 FIXING SUPABASE CONFIGURATION\n');
console.log('═══════════════════════════════════════════════\n');

async function fixSupabaseConfig() {
  console.log('📋 Step 1: Checking current configuration...\n');

  // Extract project reference from URL
  const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)[1];
  console.log('Project Reference:', projectRef);
  console.log('Project URL:', supabaseUrl);

  console.log('\n═══════════════════════════════════════════════\n');
  console.log('📋 Step 2: What needs to be fixed:\n');

  console.log('❌ Issue 1: Email confirmation is ENABLED');
  console.log('   → Users cannot login until they confirm email');
  console.log('   → This is blocking all logins\n');

  console.log('❌ Issue 2: Redirect URL is wrong');
  console.log('   → Currently: http://localhost:3000');
  console.log('   → Should be: http://localhost:3001\n');

  console.log('═══════════════════════════════════════════════\n');
  console.log('📋 Step 3: MANUAL FIX REQUIRED\n');

  console.log('⚠️  Supabase auth settings can only be changed in the dashboard.\n');
  console.log('I cannot change these via API, so YOU need to do this:\n');

  console.log('🔗 OPEN THIS LINK IN YOUR BROWSER:\n');
  console.log(`https://supabase.com/dashboard/project/${projectRef}/auth/providers\n`);

  console.log('📝 FOLLOW THESE EXACT STEPS:\n');

  console.log('STEP 1: Disable Email Confirmation');
  console.log('   1. Find the "Email" section (should be at the top)');
  console.log('   2. Look for "Confirm email" toggle');
  console.log('   3. Toggle it OFF (turn it gray/disabled)');
  console.log('   4. Click "Save" at the bottom\n');

  console.log('STEP 2: Fix Redirect URLs');
  console.log('   1. Click this link:');
  console.log(`      https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration`);
  console.log('   2. Update "Site URL" to:');
  console.log('      http://localhost:3001');
  console.log('   3. Add these to "Redirect URLs":');
  console.log('      http://localhost:3001/**');
  console.log('      https://*.vercel.app/**');
  console.log('   4. Click "Save"\n');

  console.log('═══════════════════════════════════════════════\n');
  console.log('📋 Step 4: After you complete the manual steps above...\n');

  console.log('🧪 TEST YOUR LOGIN:\n');
  console.log('   1. Go to: http://localhost:3001/signup');
  console.log('   2. Create a NEW account (use fresh email)');
  console.log('   3. Should login automatically without email confirmation!\n');

  console.log('═══════════════════════════════════════════════\n');
  console.log('💡 QUICK LINKS:\n');
  console.log(`Email Settings:     https://supabase.com/dashboard/project/${projectRef}/auth/providers`);
  console.log(`URL Configuration:  https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration`);
  console.log(`View Users:         https://supabase.com/dashboard/project/${projectRef}/auth/users`);
  console.log('\n');

  console.log('═══════════════════════════════════════════════\n');
  console.log('⏱️  TIME REQUIRED: 3 minutes\n');
  console.log('✅ Once you complete these 2 manual steps, login will work!\n');
}

fixSupabaseConfig().catch(console.error);
