const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 COMPREHENSIVE DIAGNOSTIC\n');
console.log('═══════════════════════════════════════════════\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runDiagnostic() {
  console.log('📋 STEP 1: Check Database Tables\n');

  // Check if contacts table has user_id column
  try {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('user_id')
      .limit(1);

    if (error) {
      if (error.message.includes('user_id') || error.code === '42703') {
        console.log('❌ PROBLEM: user_id column does NOT exist in contacts table');
        console.log('   → SQL migration has NOT been run yet\n');
        console.log('   FIX: You MUST run the SQL migration!\n');
      } else {
        console.log('✅ Contacts table exists');
      }
    } else {
      console.log('✅ user_id column exists in contacts table');
      console.log('   → SQL migration appears to be working!\n');
    }
  } catch (err) {
    console.log('❌ Error checking database:', err.message, '\n');
  }

  console.log('═══════════════════════════════════════════════\n');
  console.log('📋 STEP 2: Check Authentication\n');

  // Test signup
  const testEmail = `diagnostic${Date.now()}@test.com`;
  const testPassword = 'TestPass123!';

  console.log(`Creating test user: ${testEmail}`);
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signupError) {
    console.log('❌ Signup failed:', signupError.message);
  } else if (signupData.user) {
    console.log('✅ Signup successful');
    console.log(`   User ID: ${signupData.user.id}`);

    // Check if email confirmation is required
    if (signupData.user.email_confirmed_at) {
      console.log('✅ Email auto-confirmed (email confirmation is DISABLED)\n');
    } else {
      console.log('⚠️  Email NOT confirmed (email confirmation is ENABLED)');
      console.log('   → This is why login fails!\n');
      console.log('   FIX: Disable email confirmation in Supabase Dashboard\n');
    }

    // Try to login
    console.log('Testing login with same credentials...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      if (loginError.message.includes('Email not confirmed')) {
        console.log('\n⚠️  CONFIRMED PROBLEM: Email confirmation is blocking login');
      }
    } else if (loginData.user) {
      console.log('✅ Login successful!\n');
    }
  }

  console.log('═══════════════════════════════════════════════\n');
  console.log('📋 STEP 3: Summary & Action Items\n');

  console.log('ISSUES FOUND:\n');

  console.log('[ ] Issue 1: SQL Migration');
  console.log('    Status: Need to manually verify');
  console.log('    Fix: Run supabase-auth-migration.sql in Supabase SQL Editor\n');

  console.log('[ ] Issue 2: Email Confirmation');
  console.log('    Status: Likely enabled (blocking logins)');
  console.log('    Fix: Disable in Supabase Dashboard → Auth → Providers\n');

  console.log('═══════════════════════════════════════════════\n');
  console.log('🚀 QUICK FIX GUIDE:\n');
  console.log('1. RUN SQL MIGRATION (REQUIRED):');
  console.log('   → Open: https://supabase.com/dashboard/project/jyixgalqejdandnrmnqe/sql/new');
  console.log('   → Copy contents of: supabase-auth-migration.sql');
  console.log('   → Paste into SQL Editor');
  console.log('   → Click "RUN"\n');

  console.log('2. DISABLE EMAIL CONFIRMATION (for testing):');
  console.log('   → Open: https://supabase.com/dashboard/project/jyixgalqejdandnrmnqe/auth/providers');
  console.log('   → Scroll to "Email"');
  console.log('   → Toggle OFF "Enable email confirmations"');
  console.log('   → Click "Save"\n');

  console.log('3. TEST LOGIN:');
  console.log('   → Go to: http://localhost:3001/signup');
  console.log('   → Create account with valid email (e.g., test@gmail.com)');
  console.log('   → Should login automatically!\n');

  console.log('═══════════════════════════════════════════════\n');
}

runDiagnostic().catch(console.error);
