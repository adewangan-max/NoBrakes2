import { supabase } from '@/lib/supabase';
import { cache } from 'react';
import { automationService } from './automationService';

export const getLatestPosts = cache(async (limit = 10) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }

  return data;
});

export const getPostBySlug = cache(async (slug: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories(*),
      users(name, avatar_url),
      post_tags(tags(*)),
      internal_links!from_post_id(anchor_text, position, posts!to_post_id(slug, title))
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }

  return data;
});

export const getCategories = cache(async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
});

export const getPostsByCategory = cache(async (categorySlug: string) => {
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return [];

  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name, slug)')
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }

  return data;
});

export const getAllSlugs = cache(async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching slugs:', error);
    return [];
  }

  return data;
});

export const searchPosts = async (query: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .ilike('title', `%${query}%`)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error searching posts:', error);
    return [];
  }

  return data;
};

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  category_id?: string;
  featured_image?: string;
  featured_image_alt?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  canonical_url?: string;
  schema_json?: object;
  content_json?: object;
  author_id?: string; // passed from session
}

export const createPost = async (input: CreatePostInput) => {
  console.log('🚀 Creating post with automation...');

  // 1. Run automation (category auto-assign, tags, internal links, media extraction)
  const automation = await automationService.automatePost(
    input.title,
    input.content,
    input.category_id
  );

  // 2. Build the post payload — only fields that exist in the posts table
  const payload = {
    title: input.title,
    slug: input.slug,
    content: automation.contentWithInternalLinks,
    content_json: input.content_json ?? null,
    excerpt: input.excerpt ?? null,
    status: input.status,
    published_at: input.status === 'published' ? new Date().toISOString() : null,
    author_id: input.author_id ?? null,
    category_id: automation.categoryId ?? input.category_id ?? null,
    meta_title: input.meta_title ?? null,
    meta_description: input.meta_description ?? null,
    focus_keyword: input.focus_keyword ?? null,
    canonical_url: input.canonical_url ?? null,
    schema_json: input.schema_json ?? null,
    featured_image: input.featured_image ?? null,
    featured_image_alt: input.featured_image_alt ?? null,
    updated_at: new Date().toISOString(),
  };

  // 3. Insert post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert([payload])
    .select()
    .single();

  if (postError) {
    console.error('Error inserting post:', postError);
    throw postError;
  }

  // 4. Handle Tags → upsert into tags table, then insert into post_tags junction
  if (automation.tags && automation.tags.length > 0) {
    for (const tagName of automation.tags) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Try to find existing tag
      let { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', tagSlug)
        .maybeSingle();

      // Create tag if it doesn't exist
      if (!tag) {
        const { data: newTag, error: tagError } = await supabase
          .from('tags')
          .insert([{ name: tagName, slug: tagSlug }])
          .select('id')
          .maybeSingle();
        if (!tagError) tag = newTag;
      }

      // Link tag to post via post_tags junction
      if (tag) {
        await supabase
          .from('post_tags')
          .insert({ post_id: post.id, tag_id: tag.id })
          .then(({ error }) => {
            if (error) console.error('Error linking tag:', error);
          });
      }
    }
  }

  // 5. Handle Media — insert into post_media table
  if (automation.mediaUrls && automation.mediaUrls.length > 0) {
    const mediaPayload = automation.mediaUrls.map((url, index) => ({
      post_id: post.id,
      url,
      type: 'image' as const,
      alt_text: null,
      caption: null,
      position: index,
    }));

    const { error: mediaError } = await supabase.from('post_media').insert(mediaPayload);
    if (mediaError) console.error('Error inserting media:', mediaError);
  }

  // 6. Handle Internal Links — store in internal_links table
  if (automation.internalLinks && automation.internalLinks.length > 0) {
    const linkPayload = automation.internalLinks.map((link, index) => ({
      from_post_id: post.id,
      to_post_id: link.toPostId,
      anchor_text: link.anchorText,
      position: index,
    }));

    const { error: linkError } = await supabase.from('internal_links').insert(linkPayload);
    if (linkError) console.error('Error inserting internal links:', linkError);
  }

  console.log(`✅ Post created: ${post.id}`);
  return post;
};
