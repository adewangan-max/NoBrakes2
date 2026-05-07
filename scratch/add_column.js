const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://quqfktrxtlcfdjctdtkj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cWZrdHJ4dGxjZmRqY3RkdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MjIwNDEsImV4cCI6MjA5MjA5ODA0MX0.ssyq-6Xga4y_iwgko_RKVwZANwzzbl-77I0peC8ddgc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addColumn() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_counts integer DEFAULT 0;'
  });

  if (error) {
    console.error('Error adding column:', error.message);
    // If RPC fails, maybe it's not enabled. I'll try to just update a row and see if it fails.
    const { error: updateError } = await supabase.from('posts').update({ updated_counts: 0 }).match({ id: 'any-id' });
    if (updateError && updateError.message.includes('column "updated_counts" does not exist')) {
      console.log('Column definitely does not exist and I cannot add it via RPC.');
    } else {
      console.log('Column might exist or was added.');
    }
  } else {
    console.log('Column added successfully.');
  }
}

addColumn();
