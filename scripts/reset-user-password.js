const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Need SUPABASE_SERVICE_ROLE_KEY to reset passwords');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetPassword() {
  console.log('\n🔑 PASSWORD RESET TOOL\n');
  console.log('═══════════════════════════════════════════════\n');

  const userId = '33952ec5-e6a0-4bec-92cc-3a8c3d8c0498';
  const newPassword = await question('Enter NEW password (min 6 chars): ');

  if (newPassword.length < 6) {
    console.log('\n❌ Password must be at least 6 characters\n');
    rl.close();
    return;
  }

  console.log('\n🔄 Updating password...\n');

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      console.log('❌ Failed to update password:', error.message);
    } else {
      console.log('✅ PASSWORD UPDATED!\n');
      console.log('New password:', newPassword);
      console.log('\nNow try logging in at: http://localhost:3001/login\n');
    }

  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  rl.close();
}

resetPassword().catch(console.error);
