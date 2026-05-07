import { supabase } from '@/lib/supabase';
import { cache } from 'react';

export const toggleLike = async (userId: string, postId: string) => {
  // Check if already liked
  const { data, error: checkError } = await supabase
    .from('post_likes')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (checkError) {
    console.error('Error checking like status:', checkError);
    throw checkError;
  }

  if (data) {
    // Unlike
    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (deleteError) throw deleteError;
    return { liked: false };
  } else {
    // Like
    const { error: insertError } = await supabase
      .from('post_likes')
      .insert({ user_id: userId, post_id: postId });

    if (insertError) throw insertError;
    return { liked: true };
  }
};

export const getLikedPosts = cache(async (userId: string) => {
  const { data, error } = await supabase
    .from('post_likes')
    .select('*, posts(*, categories(name, slug))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching liked posts:', error);
    return [];
  }

  // Map to post objects
  return data.map((item: any) => item.posts).filter(Boolean);
});

export const checkIfLiked = async (userId: string, postId: string) => {
  const { data, error } = await supabase
    .from('post_likes')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (error) return false;
  return !!data;
};
