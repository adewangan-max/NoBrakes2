import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllSlugs } from '@/services/postService';
import { ContentRenderer } from '@/components/ContentRenderer';
import { InternalLinks } from '@/components/InternalLinks';
import { RelatedPosts } from '@/components/RelatedPosts';
import { ViewTracker } from '@/components/ViewTracker';
import { ShareButtons } from '@/components/ShareButtons';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, User, Hash, ArrowLeft, Eye, Edit } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { checkIfLiked } from '@/services/likeService';
import { LikeButton } from '@/components/LikeButton';

export const revalidate = 3600;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllSlugs();
  return posts.map((post: any) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  const post = await getPostBySlug(raw as string);

  if (!post) return {};

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    alternates: {
      canonical: post.canonical_url || `https://yoursite.com/post/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featured_image ? [{ url: post.featured_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).filter(Boolean).length || 0;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug: raw } = await params;
  const post = await getPostBySlug(raw as string);

  if (!post) notFound();

  const session = await getSession();
  const isLiked = session ? await checkIfLiked(session.id, post.id) : false;
  const isAdmin = session?.role === 'admin' || session?.role === 'editor';

  const readingTime = getReadingTime(post.content);
  const shareUrl = `https://yoursite.com/post/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.users?.name || 'Admin',
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] transition-colors duration-300">
      <ViewTracker slug={post.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            {/* Back Button */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to all posts
              </Link>
            </div>

            {/* Header */}
            <header className="mb-10">
              {post.categories && (
                <div className="inline-block mb-4">
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-200 dark:border-blue-800">
                    {post.categories.name}
                  </span>
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-[#3c4043] pb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                    {(post.users?.name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{post.users?.name || 'Admin'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Author</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400 dark:text-gray-500" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye size={14} className="text-gray-400 dark:text-gray-500" />
                  <span>{post.views || 0} views</span>
                </div>
                <div className="flex items-center gap-3">
                  <LikeButton postId={post.id} initialLiked={isLiked} showText />
                  {isAdmin && (
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#3c4043] text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-[#4a4d54] transition-colors"
                    >
                      <Edit size={12} />
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="relative aspect-[16/9] mb-10 rounded-xl overflow-hidden border border-gray-200 dark:border-[#3c4043]">
                <Image
                  src={post.featured_image}
                  alt={post.featured_image_alt || post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                />
                {post.featured_image_alt && (
                  <div className="absolute bottom-0 right-0 bg-black/60 px-2 py-1 text-xs text-gray-300 m-2 rounded">
                    {post.featured_image_alt}
                  </div>
                )}
              </div>
            )}

            {/* Main Content Area */}
            <div className="relative">
              {/* Share Buttons - Sticky Sidebar (Desktop - Far Left) */}
              <div className="hidden xl:block fixed left-8 top-1/2 -translate-y-1/2">
                <ShareButtons url={shareUrl} title={post.title} postId={post.id} initialLiked={isLiked} />
              </div>

              {/* Content Renderer - Using Tailwind classes for text colors */}
              <div className="prose prose-gray max-w-none [&>*]:text-gray-700 dark:[&>*]:text-gray-200 [&_h1]:text-gray-900 dark:[&_h1]:text-white [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h3]:text-gray-900 dark:[&_h3]:text-white [&_h4]:text-gray-900 dark:[&_h4]:text-white [&_h5]:text-gray-900 dark:[&_h5]:text-white [&_h6]:text-gray-900 dark:[&_h6]:text-white [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a:hover]:text-blue-700 dark:[&_a:hover]:text-blue-300 [&_strong]:text-gray-900 dark:[&_strong]:text-white [&_blockquote]:text-gray-600 dark:[&_blockquote]:text-gray-300 [&_code]:text-gray-800 dark:[&_code]:text-gray-200 [&_code]:bg-gray-100 dark:[&_code]:bg-gray-800 [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_li]:text-gray-700 dark:[&_li]:text-gray-200">
                <ContentRenderer content={post.content} />
              </div>
            </div>

            {/* Tags */}
            {post.post_tags && post.post_tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-[#3c4043]">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Hash size={14} />
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.post_tags.map((pt: any) => (
                    <span
                      key={pt.tags.id}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-[#3c4043] text-gray-600 dark:text-gray-400 text-sm"
                    >
                      <Hash size={10} />
                      {pt.tags.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            {post.users && (
              <div className="mt-10 p-6 rounded-xl bg-gray-50 dark:bg-[#2d2e32] border border-gray-200 dark:border-[#3c4043]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {(post.users.name || 'A')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      About {post.users.name || 'Admin'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      SEO expert and content strategist helping businesses grow their online presence through data-driven strategies.
                    </p>
                    <div className="flex gap-4 mt-3">
                      <Link href="#" className="text-xs text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Twitter
                      </Link>
                      <Link href="#" className="text-xs text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        LinkedIn
                      </Link>
                      <Link href={`/author/${post.users.id}`} className="text-xs text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        More posts
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Recommendations */}
            <div className="lg:hidden mt-10 space-y-8">
              <InternalLinks links={post.internal_links} />
              <RelatedPosts
                categorySlug={post.categories?.slug}
                currentPostId={post.id}
              />
            </div>
          </div>

          {/* Right Sidebar - Sticky Recommendations (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-8 space-y-6">
              <div className="bg-gray-50 dark:bg-[#2d2e32] rounded-xl border border-gray-200 dark:border-[#3c4043] p-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                  Recommendations
                </h3>
                <div className="space-y-6">
                  <InternalLinks
                    links={post.internal_links}
                    isSidebar={true}
                  />
                  <RelatedPosts
                    categorySlug={post.categories?.slug}
                    currentPostId={post.id}
                    isSidebar={true}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}