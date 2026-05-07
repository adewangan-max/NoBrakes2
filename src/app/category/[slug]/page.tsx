import { getPostsByCategory, getCategories } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find(c => c.slug === slug);

  if (!category) return {};

  return {
    title: category.meta_title || `${category.name} Articles`,
    description: category.meta_description || category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const posts = await getPostsByCategory(slug);
  const categories = await getCategories();
  const category = categories.find(c => c.slug === slug);

  if (!category && posts.length === 0) notFound();

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-16 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-black text-white mb-6">
          Topic: <span className="text-gradient">{category?.name || slug}</span>
        </h1>
        {category?.description && (
          <p className="text-xl text-slate-400 leading-relaxed">
            {category.description}
          </p>
        )}
      </header>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any, index: number) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
          <p className="text-slate-400">No articles found in this category yet.</p>
        </div>
      )}
    </div>
  );
}
