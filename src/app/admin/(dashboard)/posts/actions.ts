'use server';

import { createPost, updatePost, incrementUpdateCount, CreatePostInput, UpdatePostInput } from '@/services/postService';
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
      author_id: session.id, // ← inject from session
      tags: formData.tags,
      media: formData.media,
      internalLinks: formData.internalLinks,
    });

    revalidatePath('/admin/posts');
    revalidatePath('/');
    // revalidate created post page
    if (post?.id && post?.slug) revalidatePath(`/post/${post.slug}+${post.id}`);
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

  try {
    const post = await updatePost({
      id: postId,
      ...formData,
    });

    revalidatePath('/admin/posts');
    revalidatePath(`/post/${post.slug}+${post.id}`);
    revalidatePath('/');
    return { success: true, post };
  } catch (error: any) {
    console.error('updatePostAction error:', error);
    return { success: false, error: error.message ?? 'Failed to update post.' };
  }
}

export async function incrementUpdateAction(postId: string, formData: Partial<CreatePostInput>) {
  const session = await getSession();
  if (!session) redirect('/login');
  
  // Strict check for editor role as requested
  if (session.role !== 'editor') {
    return { success: false, error: 'Only editors can perform this update.' };
  }

  try {
    // 1. Update the post data
    await updatePost({
      id: postId,
      ...formData,
    });

    // 2. Increment the update count
    const post = await incrementUpdateCount(postId);

    revalidatePath('/admin/posts');
    revalidatePath('/admin/update-post');
    revalidatePath(`/post/${post.slug}+${post.id}`);
    revalidatePath('/');
    
    return { success: true, post };
  } catch (error: any) {
    console.error('incrementUpdateAction error:', error);
    return { success: false, error: error.message ?? 'Failed to update post.' };
  }
}

export async function publishPostAction(postId: string) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin' && session.role !== 'editor') {
    return { success: false, error: 'Unauthorized to publish posts.' };
  }

  try {
    const post = await updatePost({
      id: postId,
      status: 'published',
      published_at: new Date().toISOString()
    });

    revalidatePath('/admin/posts');
    revalidatePath(`/post/${post.slug}+${post.id}`);
    revalidatePath('/');
    return { success: true, post };
  } catch (error: any) {
    console.error('publishPostAction error:', error);
    return { success: false, error: error.message ?? 'Failed to publish post.' };
  }
}
