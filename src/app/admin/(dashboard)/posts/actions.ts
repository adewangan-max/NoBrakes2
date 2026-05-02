'use server';

import { createPost, CreatePostInput } from '@/services/postService';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPostAction(formData: Partial<CreatePostInput>) {
  // 1. Verify session + admin role
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  if (session.role !== 'admin' && session.role !== 'editor') {
    return { success: false, error: 'Unauthorized to create posts.' };
  }

  // 2. Validate required fields
  if (!formData.title?.trim()) {
    return { success: false, error: 'Title is required.' };
  }
  if (!formData.slug?.trim()) {
    return { success: false, error: 'Slug is required.' };
  }

  try {
    const post = await createPost({
      title: formData.title!,
      slug: formData.slug!,
      content: formData.content ?? '',
      excerpt: formData.excerpt,
      status: formData.status ?? 'draft',
      category_id: formData.category_id || undefined,
      featured_image: formData.featured_image || undefined,
      featured_image_alt: formData.featured_image_alt || undefined,
      meta_title: formData.meta_title || undefined,
      meta_description: formData.meta_description || undefined,
      focus_keyword: formData.focus_keyword || undefined,
      canonical_url: formData.canonical_url || undefined,
      author_id: session.userId, // ← inject from session
    });

    revalidatePath('/admin/posts');
    revalidatePath('/');
    return { success: true, post };
  } catch (error: any) {
    console.error('createPostAction error:', error);
    return { success: false, error: error.message ?? 'Failed to create post.' };
  }
}

export async function updatePostAction(postId: string, formData: Partial<CreatePostInput>) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin' && session.role !== 'editor') {
    return { success: false, error: 'Unauthorized to edit posts.' };
  }

  const { supabase } = await import('@/lib/supabase');

  const payload = {
    ...(formData.title && { title: formData.title }),
    ...(formData.slug && { slug: formData.slug }),
    ...(formData.content !== undefined && { content: formData.content }),
    ...(formData.excerpt !== undefined && { excerpt: formData.excerpt }),
    ...(formData.status && { status: formData.status }),
    ...(formData.category_id !== undefined && { category_id: formData.category_id || null }),
    ...(formData.featured_image !== undefined && { featured_image: formData.featured_image || null }),
    ...(formData.featured_image_alt !== undefined && { featured_image_alt: formData.featured_image_alt || null }),
    ...(formData.meta_title !== undefined && { meta_title: formData.meta_title || null }),
    ...(formData.meta_description !== undefined && { meta_description: formData.meta_description || null }),
    ...(formData.focus_keyword !== undefined && { focus_keyword: formData.focus_keyword || null }),
    ...(formData.canonical_url !== undefined && { canonical_url: formData.canonical_url || null }),
    published_at:
      formData.status === 'published' ? new Date().toISOString() : undefined,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('posts').update(payload).eq('id', postId);

  if (error) {
    console.error('updatePostAction error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/posts');
  revalidatePath('/');
  return { success: true };
}
