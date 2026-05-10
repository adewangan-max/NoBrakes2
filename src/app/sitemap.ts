import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nobrakes2.vercel.app'

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('status', 'published')

    if (error) {
      console.error(error)
      return []
    }

    const postUrls = (posts || []).map((post) => ({
      url: `${baseUrl}/post/${post.slug}`,
      lastModified: post.updated_at || undefined,
    }))

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
      ...postUrls,
    ]
  } catch (e) {
    console.error(e)

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
    ]
  }
}