export type UserRole = 'admin' | 'editor' | 'viewer';
export type PostStatus = 'draft' | 'published' | 'archived';
export type MediaType = 'image' | 'video' | 'document';
export type RedirectStatus = 'active' | 'inactive';

/** Matches public.users */
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/** Matches public.categories */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

/** Matches public.posts */
export interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  content_json?: object;
  excerpt?: string;
  status: PostStatus;
  published_at?: string;
  author_id?: string;
  category_id?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  canonical_url?: string;
  schema_json?: object;
  featured_image?: string;
  featured_image_alt?: string;
  created_at: string;
  updated_at: string;
}

/** Matches public.tags */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

/** Matches public.post_tags */
export interface PostTag {
  post_id: string;
  tag_id: string;
}

/** Matches public.post_media */
export interface PostMedia {
  id: string;
  post_id: string;
  url: string;
  type: MediaType;
  alt_text?: string;
  caption?: string;
  position?: number;
  created_at: string;
}

/** Matches public.internal_links */
export interface InternalLink {
  id: string;
  from_post_id?: string;
  to_post_id?: string;
  anchor_text: string;
  position?: number;
  created_at: string;
}

/** Matches public.redirects */
export interface Redirect {
  id: string;
  from_url: string;
  to_url: string;
  type: number;  // 301, 302, etc.
  status: RedirectStatus;
  created_at: string;
}
