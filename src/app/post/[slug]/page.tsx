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
import { Calendar, Clock, User, Hash, ArrowLeft, Eye } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      <ViewTracker slug={post.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="relative container mx-auto px-6 py-8 md:py-12 max-w-7xl bg-transparent">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            {/* Back Button */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors text-sm group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to all posts
              </Link>
            </div>

            {/* Header */}
            <header className="mb-12 text-center lg:text-left">
              {post.categories && (
                <Link
                  href={`/category/${post.categories.slug}`}
                  className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-6 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-300"
                >
                  {post.categories.name}
                </Link>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                    {(post.users?.name || 'A')[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white text-sm">{post.users?.name || 'Admin'}</div>
                    <div className="text-xs text-slate-500">Author</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>{post.views || 0} views</span>
                </div>
                <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
                  <LikeButton postId={post.id} initialLiked={isLiked} showText />
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="relative aspect-[16/9] mb-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src={post.featured_image}
                  alt={post.featured_image_alt || post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                />
                {post.featured_image_alt && (
                  <div className="absolute bottom-0 right-0 bg-black/50 backdrop-blur-sm px-3 py-1 text-xs text-slate-400 m-3 rounded">
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

              {/* Content Renderer */}
              <div className="prose prose-invert prose-lg max-w-none">
                <ContentRenderer content={post.content} />
              </div>
            </div>

            {/* Tags */}
            {post.post_tags && post.post_tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                  <Hash size={14} />
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-3">
                  {post.post_tags.map((pt: any) => (
                    <Link
                      key={pt.tags.id}
                      href={`/tag/${pt.tags.slug}`}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300 text-sm group"
                    >
                      <Hash size={12} className="group-hover:rotate-12 transition-transform" />
                      {pt.tags.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            {post.users && (
              <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    {(post.users.name || 'A')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">About {post.users.name || 'Admin'}</h3>
                    <p className="text-slate-400 text-sm">
                      SEO expert and content strategist helping businesses grow their online presence through data-driven strategies.
                    </p>
                    <div className="flex gap-3 mt-3">
                      <Link href="#" className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">Twitter</Link>
                      <Link href="#" className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">LinkedIn</Link>
                      <Link href={`/author/${post.users.id}`} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">More posts</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Recommendations (Hidden on desktop) */}
            <div className="lg:hidden mt-12 space-y-8">
              <InternalLinks links={post.internal_links} />
              <RelatedPosts
                categorySlug={post.categories?.slug}
                currentPostId={post.id}
              />
            </div>
          </div>

          {/* Right Sidebar - Sticky Recommendations (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-8 scrollbar-hide space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
                  Recommendations
                </h3>
                <div className="space-y-8">
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