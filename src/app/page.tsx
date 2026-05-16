import { getLatestPosts } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import { Metadata } from 'next';
import { Sparkles, Mail, ArrowRight } from 'lucide-react';

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

      <div className="min-h-screen bg-white dark:bg-[#202124] transition-colors duration-300">
        {/* Hero Section - Google Style */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-[#202124] dark:to-[#202124]">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#3c4043_1px,transparent_1px)] opacity-40" />

          <div className="relative container mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32 max-w-6xl">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#3c4043] mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400" />
                </span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Exclusive Content</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
                Exclusive Articles
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                High-value, specialized insights for a limited audience. We ignore the noise and trending fads to bring you{' '}
                <span className="text-blue-600 dark:text-blue-400 font-semibold">undiluted expertise</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition-colors shadow-sm">
                  Explore Articles
                </button>
                <button className="px-6 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3c4043] font-medium transition-colors">
                  Subscribe Now
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{posts.length}+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">100+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Topics Coming</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">24/7</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Access</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        {posts.length >= 3 && (
          <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={24} className="text-blue-500 dark:text-blue-400" />
                  Featured Articles
                </h2>
                <div className="w-12 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-500">Editor's pick</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(0, 3).map((post: any, index: number) => (
                <div key={post.id} className="group cursor-pointer">
                  <PostCard post={post} index={index} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Posts Section */}
        <section
          id="latest"
          className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-7xl"
          aria-label="Latest articles"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
              Latest Articles
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Stay updated with our most recent content. Fresh insights delivered weekly.
            </p>
            <div className="w-12 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.slice(3).map((post: any, index: number) => (
              <PostCard key={post.id} post={post} index={index + 3} />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#3c4043] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No posts found.</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Check back soon for new content!</p>
            </div>
          )}

          {/* Load More Button */}
          {posts.length > 6 && (
            <div className="text-center mt-12">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3c4043] font-medium transition-colors">
                Load More Articles
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Newsletter Section - Google Style */}
        <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-5xl">
          <div className="bg-gray-50 dark:bg-[#2d2e32] rounded-2xl p-8 md:p-10 text-center border border-gray-200 dark:border-[#3c4043]">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <Mail size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Never Miss an Update
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
              Get our specialized, high-signal deep dives delivered directly to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-[#202124] border border-gray-300 dark:border-[#3c4043] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition-colors shadow-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="container mx-auto px-4 sm:px-6 pb-12 max-w-7xl">
          <div className="text-center text-xs text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-[#3c4043] pt-8">
            <p>
              © {new Date().getFullYear()} NoBrakes. All rights reserved.
              {' '}<a href="/sitemap.xml" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sitemap</a>
              {' '}|{' '}
              <a href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
              {' '}|{' '}
              <a href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}