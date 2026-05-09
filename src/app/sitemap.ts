import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobrakes2.vercel.app';
  // Ensure no trailing slash for consistency
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  try {
    // Fetch all published posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (postsError) throw postsError;

    // Fetch all categories
    const { data: categories, error: catsError } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false });

    if (catsError) throw catsError;

    const postUrls = (posts || []).map((post) => ({
      url: `${baseUrl}/post/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const categoryUrls = (categories || []).map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: cat.updated_at ? new Date(cat.updated_at).toISOString() : new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      ...postUrls,
      ...categoryUrls,
    ];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Fallback to at least the home page if DB fails
    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
    ];
  }
}
