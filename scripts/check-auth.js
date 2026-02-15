const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuth() {
  console.log('🔍 Checking Supabase Authentication Setup...\n');

  // Test 1: Check if we can connect
  console.log('1. Testing connection...');
  try {
    const { data, error } = await supabase.from('contacts').select('count').limit(1);
    if (error && error.message.includes('relation')) {
      console.log('   ⚠️  Contacts table not found (this is expected if migration not run yet)');
    } else {
      console.log('   ✅ Connected to Supabase');
    }
  } catch (err) {
    console.log('   ❌ Connection failed:', err.message);
  }

  // Test 2: Try to signup a test user
  console.log('\n2. Testing signup...');
  const testEmail = `test${Date.now()}@gmail.com`;
  const testPassword = 'test123456';

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.log('   ❌ Signup error:', error.message);
      console.log('\n📋 Common Issues:');
      console.log('   - Email confirmations might be required');
      console.log('   - Check Supabase Dashboard → Authentication → Settings');
      console.log('   - Disable "Confirm email" if you want instant signups');
    } else if (data.user) {
      console.log('   ✅ Signup works!');
      console.log('   Test user created:', testEmail);

      // Test 3: Try to login
      console.log('\n3. Testing login...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (loginError) {
        console.log('   ❌ Login error:', loginError.message);
      } else if (loginData.user) {
        console.log('   ✅ Login works!');

        // Cleanup
        await supabase.auth.signOut();
        console.log('   ✅ Cleanup: Logged out test user');
      }
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }

  console.log('\n✨ Check complete!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Go to https://supabase.com/dashboard/project/jyixgalqejdandnrmnqe/auth/users');
  console.log('   2. Check Authentication → Settings');
  console.log('   3. Make sure "Enable email confirmations" is OFF for testing');
  console.log('   4. Try creating an account in your app\n');
}

checkAuth().catch(console.error);
