const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testLogin() {
  console.log('\n🔐 LOGIN TEST\n');
  console.log('═══════════════════════════════════════════════\n');

  const email = await question('Enter your email: ');
  const password = await question('Enter your password: ');

  console.log('\n📝 Attempting login...\n');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      console.log('❌ LOGIN FAILED\n');
      console.log('Error message:', error.message);
      console.log('Error status:', error.status);

      console.log('\n🔍 WHAT THIS MEANS:\n');

      if (error.message.includes('Invalid login credentials')) {
        console.log('   → Email or password is incorrect');
        console.log('   → Double-check your credentials\n');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('   → Your email needs to be confirmed');
        console.log('   → Check your inbox for confirmation link\n');
      } else if (error.message.includes('not found')) {
        console.log('   → User does not exist');
        console.log('   → Try signing up first\n');
      } else {
        console.log('   → Unexpected error');
        console.log('   → Full error:', error);
      }

      rl.close();
      return;
    }

    if (data.user) {
      console.log('✅ LOGIN SUCCESSFUL!\n');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');

      if (data.session) {
        console.log('\n✅ SESSION CREATED');
        console.log('Access token:', data.session.access_token.substring(0, 30) + '...');
        console.log('Expires at:', new Date(data.session.expires_at * 1000).toLocaleString());
      }

      console.log('\n🎉 You should be able to login in the app now!\n');
    }

  } catch (err) {
    console.log('❌ UNEXPECTED ERROR:', err.message);
  }

  rl.close();
}

testLogin().catch(console.error);
