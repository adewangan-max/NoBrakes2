"use server";

import { searchPosts } from '@/services/postService';

export async function performSearch(query: string) {
  if (!query) return [];
  return await searchPosts(query);
}
