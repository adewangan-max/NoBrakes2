import { supabase } from '@/lib/supabase';
import { cache } from 'react';
import { automationService } from './automationService';
import { Post, PostStatus, MediaType } from '@/types/database';

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
      users!author_id(name, avatar_url),
      post_tags(tags(*)),
      internal_links!from_post_id(anchor_text, position, posts!to_post_id(id, slug, title)),
      post_media(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Post not found is not an "error" we want to log
    console.error('Error fetching post by slug:', error.message, error.code, error.details);
    return null;
  }

  return data;
});

export const getPostById = cache(async (id: string) => {
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
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching post by id:', error.message, error.code, error.details);
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
    .select('id, slug')
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
  excerpt?: string | null;
  status: PostStatus;
  published_at?: string | null;
  category_id?: string | null;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  canonical_url?: string | null;
  schema_json?: object | null;
  content_json?: object | null;
  author_id?: string | null;
  // Optional relational data
  tags?: string[];
  media?: Array<{ url: string; type: MediaType; alt_text?: string; caption?: string }>;
  internalLinks?: Array<{ to_post_id: string; anchor_text: string; position?: number }>;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

/** Helper: Sync tags for a post */
async function syncTags(postId: string, tagNames: string[]) {
  if (!tagNames || tagNames.length === 0) return;

  const tagIds: string[] = [];

  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Upsert tag
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .upsert({ name, slug }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (tag) tagIds.push(tag.id);
    else if (tagError) console.error('Error upserting tag:', tagError);
  }

  // Link tags (simple clear and re-insert for update, or just insert for create)
  // For simplicity in createPost we just insert. For updatePost we'd delete old ones.
  if (tagIds.length > 0) {
    const postTags = tagIds.map(tagId => ({ post_id: postId, tag_id: tagId }));
    const { error: linkError } = await supabase.from('post_tags').upsert(postTags, { onConflict: 'post_id,tag_id' });
    if (linkError) console.error('Error linking tags:', linkError);
  }
}

/** Helper: Sync media for a post */
async function syncMedia(postId: string, mediaItems: Array<{ url: string; type: MediaType; alt_text?: string; caption?: string }>) {
  if (!mediaItems || mediaItems.length === 0) return;

  const payload = mediaItems.map((item, index) => ({
    post_id: postId,
    url: item.url,
    type: item.type,
    alt_text: item.alt_text ?? null,
    caption: item.caption ?? null,
    position: index,
  }));

  const { error } = await supabase.from('post_media').insert(payload);
  if (error) console.error('Error syncing media:', error);
}

/** Helper: Sync internal links for a post */
async function syncInternalLinks(postId: string, links: Array<{ to_post_id: string; anchor_text: string; position?: number }>) {
  if (!links || links.length === 0) return;

  const payload = links.map((link, index) => ({
    from_post_id: postId,
    to_post_id: link.to_post_id,
    anchor_text: link.anchor_text,
    position: link.position ?? index,
  }));

  const { error } = await supabase.from('internal_links').insert(payload);
  if (error) console.error('Error syncing internal links:', error);
}

export const createPost = async (input: CreatePostInput) => {
  console.log('🚀 Creating post...');

  // 1. Run automation to get defaults/suggestions
  const automation = await automationService.automatePost(
    input.title,
    input.content,
    input.category_id ?? undefined
  );

  // 2. Build the post payload
  const payload = {
    title: input.title,
    slug: input.slug,
    content: input.content || automation.contentWithInternalLinks,
    content_json: input.content_json ?? null,
    excerpt: input.excerpt ?? null,
    status: input.status,
    published_at: input.published_at ?? (input.status === 'published' ? new Date().toISOString() : null),
    author_id: input.author_id ?? null,
    category_id: input.category_id ?? automation.categoryId ?? null,
    meta_title: input.meta_title ?? null,
    meta_description: input.meta_description ?? null,
    focus_keyword: input.focus_keyword ?? null,
    canonical_url: input.canonical_url ?? null,
    schema_json: input.schema_json ?? null,
    featured_image: input.featured_image ?? null,
    featured_image_alt: input.featured_image_alt ?? null,
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

  // 4. Handle Tags (Manual + Automated)
  const allTags = Array.from(new Set([...(input.tags || []), ...(automation.tags || [])]));
  await syncTags(post.id, allTags);

  // 5. Handle Media (Manual + Automated)
  const manualMedia = input.media || [];
  const autoMedia = (automation.mediaUrls || []).map(url => ({ url, type: 'image' as MediaType }));
  // Avoid duplicates by URL
  const allMedia = [...manualMedia];
  autoMedia.forEach(am => {
    if (!allMedia.some(m => m.url === am.url)) allMedia.push(am);
  });
  await syncMedia(post.id, allMedia);

  // 6. Handle Internal Links (Manual + Automated)
  const manualLinks = (input.internalLinks || []).map(l => ({ to_post_id: l.to_post_id, anchor_text: l.anchor_text, position: l.position }));
  const autoLinks = (automation.internalLinks || []).map(l => ({ to_post_id: l.toPostId, anchor_text: l.anchorText }));
  const allLinks = [...manualLinks, ...autoLinks];
  await syncInternalLinks(post.id, allLinks);

  console.log(`✅ Post created: ${post.id}`);
  return post;
};

export const updatePost = async (input: UpdatePostInput) => {
  console.log(`🔄 Updating post: ${input.id}`);

  // 1. Get existing post to check for slug changes (for redirects)
  const { data: existingPost, error: fetchError } = await supabase
    .from('posts')
    .select('slug')
    .eq('id', input.id)
    .single();

  if (fetchError || !existingPost) {
    throw new Error('Post not found');
  }

  // 2. Handle Redirect if slug changed
  if (input.slug && input.slug !== existingPost.slug) {
    console.log(`🔀 Slug changed from ${existingPost.slug} to ${input.slug}. Creating redirect.`);
    const { error: redirectError } = await supabase
      .from('redirects')
      .insert({
        from_url: `/post/${existingPost.slug}`,
        to_url: `/post/${input.slug}+${input.id}`,
        type: 301,
        status: 'active'
      });
    
    if (redirectError) console.error('Error creating redirect:', redirectError);
  }

  // 3. Prepare Update Payload
  const updatePayload: Partial<Post> = {
    ...input,
    updated_at: new Date().toISOString(),
  };
  
  // Remove fields that aren't in the posts table
  delete (updatePayload as any).tags;
  delete (updatePayload as any).media;
  delete (updatePayload as any).internalLinks;
  delete (updatePayload as any).id;

  // 4. Update Post
  const { data: updatedPost, error: updateError } = await supabase
    .from('posts')
    .update(updatePayload)
    .eq('id', input.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating post:', updateError);
    throw updateError;
  }

  // 5. Update Relational Data if provided
  if (input.tags) {
    // Clear old tags first
    await supabase.from('post_tags').delete().eq('post_id', input.id);
    await syncTags(input.id, input.tags);
  }

  if (input.media) {
    // Clear old media or append? Usually clear and re-sync for post media
    await supabase.from('post_media').delete().eq('post_id', input.id);
    await syncMedia(input.id, input.media);
  }

  if (input.internalLinks) {
    await supabase.from('internal_links').delete().eq('from_post_id', input.id);
    await syncInternalLinks(input.id, input.internalLinks);
  }

  console.log(`✅ Post updated: ${updatedPost.id}`);
  return updatedPost;
};

export const getPostsForUpdate = cache(async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, content, updated_counts, updated_at, status')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts for update:', error);
    return [];
  }

  return data;
});

export const incrementUpdateCount = async (id: string) => {
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('updated_counts')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const newCount = (post.updated_counts || 0) + 1;

  const { data, error } = await supabase
    .from('posts')
    .update({ updated_counts: newCount, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

