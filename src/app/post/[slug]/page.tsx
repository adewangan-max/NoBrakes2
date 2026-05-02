import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllSlugs } from '@/services/postService';
import { ContentRenderer } from '@/components/ContentRenderer';
import { InternalLinks } from '@/components/InternalLinks';
import { RelatedPosts } from '@/components/RelatedPosts';
import { ViewTracker } from '@/components/ViewTracker';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, User, Hash } from 'lucide-react';

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
  const { slug } = await params;
  const post = await getPostBySlug(slug);

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

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  // Structured Data (JSON-LD)
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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <ViewTracker slug={slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-12 text-center">
        {post.categories && (
          <a
            href={`/category/${post.categories.slug}`}
            className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-6 hover:bg-indigo-500/20 transition-all"
          >
            {post.categories.name}
          </a>
        )}

        <h1 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight font-outfit">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>{post.users?.name || 'Admin'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{Math.max(1, Math.ceil((post.content?.split(/\s+/).filter(Boolean).length ?? 0) / 200))} min read</span>
          </div>
        </div>
      </header>

      {post.featured_image && (
        <div className="relative aspect-video mb-16 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <Image
            src={post.featured_image}
            alt={post.featured_image_alt || post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="relative">
        <ContentRenderer content={post.content} />
      </div>

      {post.post_tags && post.post_tags.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-3">
          {post.post_tags.map((pt: any) => (
            <a
              key={pt.tags.id}
              href={`/tag/${pt.tags.slug}`}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all text-sm"
            >
              <Hash className="w-3 h-3" />
              {pt.tags.name}
            </a>
          ))}
        </div>
      )}

      <InternalLinks links={post.internal_links} />

      <RelatedPosts
        categorySlug={post.categories?.slug}
        currentPostId={post.id}
      />
    </div>
  );
}
