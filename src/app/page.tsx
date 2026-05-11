import { getLatestPosts } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import { Metadata } from 'next';
import { Sparkles } from 'lucide-react';

export const revalidate = 3600; // 1 hour

// SEO Metadata
export const metadata: Metadata = {
  title: 'NoBrakes',
  description: 'A private, specialized publication providing deep, valuable content for a dedicated audience. No generic trends, just high-signal expertise.',
  keywords: 'exclusive insights, specialized content, deep dives, private publication, expert analysis, high-signal',
  authors: [{ name: 'NoBrakes Team' }],
  openGraph: {
    title: 'Exclusive Insights | NoBrakes',
    description: 'A private, specialized publication providing deep, valuable content for a dedicated audience.',
    type: 'website',
    locale: 'en_US',
    siteName: 'NoBrakes',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NoBrakes Publication',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exclusive Insights & Analysis | NoBrakes',
    description: 'A private, specialized publication providing deep, valuable content for a dedicated audience.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://nobrakes2.vercel.app/',
  },
};

// Structured Data for Blog
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'NoBrakes',
  description: 'Specialized, high-signal content for a dedicated audience.',
  url: 'https://nobrakes2.vercel.app/',
  publisher: {
    '@type': 'Organization',
    name: 'NoBrakes',
    logo: {
      '@type': 'ImageObject',
      url: 'https://nobrakes2.vercel.app/',
    },
  },
  sameAs: [
    'https://twitter.com/nobrakes',
    'https://github.com/nobrakes',
  ],
};

export default async function Home() {
  const posts = await getLatestPosts(100);

  // Structured data for posts
  const postsStructuredData = posts.map((post: any) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.content?.substring(0, 160),
    url: `https://nobrakes2.vercel.app.com/post/${post.slug}`,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'NoBrakes Team',
    },
    ...(post.featured_image && {
      image: {
        '@type': 'ImageObject',
        url: post.featured_image,
      },
    }),
  }));

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(postsStructuredData) }}
        />
      )}

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-3xl" />

          <div className="relative container mx-auto px-6 py-20 md:py-32 max-w-6xl font-quantico">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-indigo-400">Exclusive Content</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-white via-white to-indigo-200 bg-clip-text text-transparent ">
                Exclusive Articles
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                High-value, specialized insights for a limited audience. We ignore the noise and trending fads to bring you{' '}
                <span className="text-indigo-400 font-semibold">undiluted expertise</span>.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{posts.length}+</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Articles</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-white">100+</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Topics Upcomming</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section - Optional, show first 3 posts as featured */}
        {posts.length >= 3 && (
          <section className="container mx-auto px-6 py-16 max-w-7xl">
            <div className="flex items-center justify-between mb-10">
              <div>

                <h2 className="text-2xl md:text-3xl font-bold text-white font-quantico flex items-center gap-2">
                  <Sparkles size={28} className="text-indigo-400" />
                  Featured Articles
                </h2>
                <div className="w-[30%] h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2" />
              </div>
              <span className="text-xs text-slate-500">✨ Editor's pick</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.slice(0, 3).map((post: any, index: number) => (
                <div key={post.id} className="group cursor-pointer font-quantico">
                  <PostCard post={post} index={index} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Posts Section */}
        <section
          id="latest"
          className="container mx-auto px-6 py-16 max-w-7xl"
          aria-label="Latest articles"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-quantico mb-3">
              Latest Articles
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Stay updated with our most recent content. Fresh insights delivered weekly.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-quantico">
            {posts.slice(3).map((post: any, index: number) => (
              <PostCard key={post.id} post={post} index={index + 3} />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg">No posts found.</p>
              <p className="text-slate-600 text-sm mt-1">Check back soon for new content!</p>
            </div>
          )}
        </section>

        {/* Newsletter Section */}
        <section className="container mx-auto px-6 py-16 max-w-6xl">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 border border-indigo-500/20 p-8 md:p-12 text-center font-quantico">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Never Miss an Update
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto ">
                Get our specialized, high-signal deep dives delivered directly to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-[10px] text-slate-600 mt-3">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>


        {/* SEO Footer Note */}
        <div className="container mx-auto px-6 pb-16 max-w-7xl">
          <div className="text-center text-xs text-slate-600 border-t border-white/5 pt-8">
            <p>
              © {new Date().getFullYear()} NoBrakes. All rights reserved.
              {' '}<a href="/sitemap.xml" className="hover:text-indigo-400 transition-colors">Sitemap</a>
              {' '}|{' '}<a href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}