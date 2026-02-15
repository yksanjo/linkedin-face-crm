const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 TESTING SIGNUP FLOW\n');
console.log('═══════════════════════════════════════════════\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing credentials\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  // Use a proper email format
  const testEmail = `testuser${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';

  console.log('📝 Attempting signup...');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}\n`);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    console.log('📊 RESPONSE:\n');

    if (error) {
      console.log('❌ ERROR:', error.message);
      console.log('   Error code:', error.status);
      console.log('\n🔍 COMMON CAUSES:');
      console.log('   1. Invalid email format (use @gmail.com, @yahoo.com, etc.)');
      console.log('   2. Password too weak (need 6+ characters)');
      console.log('   3. Supabase auth not enabled');
      console.log('   4. Email already exists\n');
      return;
    }

    if (data.user) {
      console.log('✅ USER CREATED!');
      console.log('   User ID:', data.user.id);
      console.log('   Email:', data.user.email);
      console.log('   Created at:', data.user.created_at);

      if (data.user.email_confirmed_at) {
        console.log('   Email confirmed: ✅ YES (auto-confirmed)');
      } else {
        console.log('   Email confirmed: ❌ NO (confirmation required)');
        console.log('\n⚠️  THIS IS THE PROBLEM!');
        console.log('   The user was created but needs email confirmation.');
        console.log('   They cannot login until they confirm their email.\n');
      }

      // Check session
      if (data.session) {
        console.log('\n✅ SESSION CREATED!');
        console.log('   Access token:', data.session.access_token.substring(0, 20) + '...');
        console.log('   User can login immediately!\n');
      } else {
        console.log('\n❌ NO SESSION CREATED');
        console.log('   User cannot login until email is confirmed\n');
      }

    } else {
      console.log('⚠️  Signup completed but no user data returned');
      console.log('   This usually means email confirmation is required\n');
    }

    // Try to check if user exists in Supabase
    console.log('═══════════════════════════════════════════════\n');
    console.log('📋 NEXT STEPS:\n');
    console.log('1. Check Supabase Users:');
    console.log('   → https://supabase.com/dashboard/project/jyixgalqejdandnrmnqe/auth/users');
    console.log('   → You should see the new user listed\n');

    console.log('2. Check email confirmation setting:');
    console.log('   → https://supabase.com/dashboard/project/jyixgalqejdandnrmnqe/auth/providers');
    console.log('   → Look for "Enable email confirmations"');
    console.log('   → Toggle it OFF for instant signups\n');

  } catch (err) {
    console.log('❌ UNEXPECTED ERROR:', err.message);
    console.log('\nFull error:', err);
  }
}

testSignup().catch(console.error);
