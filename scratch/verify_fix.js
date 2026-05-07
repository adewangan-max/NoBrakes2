const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://quqfktrxtlcfdjctdtkj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cWZrdHJ4dGxjZmRqY3RkdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MjIwNDEsImV4cCI6MjA5MjA5ODA0MX0.ssyq-6Xga4y_iwgko_RKVwZANwzzbl-77I0peC8ddgc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPost() {
  const slug = 'mysterious-deep-sea-creatures-30-hidden-animals-of-the-abyss';
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories(*),
      users!author_id(name, avatar_url),
      post_tags(tags(*)),
      internal_links!from_post_id(anchor_text, position, posts!to_post_id(id, slug, title)),
      post_media(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error:', error.message, error.code, error.details);
  } else {
    console.log('Post found with fixed joins:', data.title);
  }
}

checkPost();
