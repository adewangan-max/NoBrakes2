import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // Cache for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nobrakes2.vercel.app'

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('status', 'published')

    // If there's an error, fall back to at least the homepage
    if (error) {
      console.error('Sitemap fetch error:', error)
      return [{ url: baseUrl, lastModified: new Date() }]
    }

    const postUrls = (posts || []).map((post) => ({
      url: `${baseUrl}/post/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      ...postUrls,
    ]
  } catch (e) {
    console.error('Sitemap generation exception:', e)
    return [{ url: baseUrl, lastModified: new Date() }]
  }
}
