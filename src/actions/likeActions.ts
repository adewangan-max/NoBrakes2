'use server';

import { getSession } from '@/lib/auth';
import { toggleLike as toggleLikeService } from '@/services/likeService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function toggleLikeAction(postId: string) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  try {
    const result = await toggleLikeService(session.id, postId);
    revalidatePath('/saved-posts');
    revalidatePath(`/post/${postId}`); // Revalidate if we use id in path
    // Also revalidate by tag or generic if needed, but path is usually enough
    return { success: true, liked: result.liked };
  } catch (error) {
    console.error('Action error toggling like:', error);
    return { success: false, error: 'Failed to toggle like' };
  }
}
