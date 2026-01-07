const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running authentication migration...\n');

  // Read the migration SQL file
  const migrationPath = path.join(__dirname, '..', 'supabase-auth-migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split SQL into individual statements (rough split, good enough for our use)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip comments and notes
    if (statement.startsWith('--') || statement.toLowerCase().includes('note:')) {
      continue;
    }

    console.log(`Executing statement ${i + 1}/${statements.length}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase.from('_').select('*').limit(0);

        if (error.message.includes('function') || error.message.includes('does not exist')) {
          console.log('   ⚠️  Using SQL Editor method - copy supabase-auth-migration.sql to Supabase Dashboard > SQL Editor');
          console.log('   Skipping automated execution...\n');
          break;
        } else {
          console.error('   ❌ Error:', error.message);
        }
      } else {
        console.log('   ✅ Success');
      }
    } catch (err) {
      console.error('   ❌ Error:', err.message);
    }
  }

  console.log('\n📋 Manual Migration Instructions:');
  console.log('   1. Go to https://supabase.com/dashboard');
  console.log('   2. Select your project');
  console.log('   3. Go to SQL Editor');
  console.log('   4. Click "New query"');
  console.log('   5. Copy the contents of supabase-auth-migration.sql');
  console.log('   6. Paste and click "Run"');
  console.log('\n✨ Migration instructions prepared!\n');
}

runMigration().catch(console.error);
