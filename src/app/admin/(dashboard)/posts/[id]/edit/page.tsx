import { getPostById, getCategories } from '@/services/postService';
import { PostEditor } from '@/components/admin/PostEditor';
import { Sparkles } from "lucide-react";
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);
  const categories = await getCategories();

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={24} className="text-violet-400" />

          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Edit Post
          </h1>

          <span className="text-xl">✍️</span>
        </div>

        {/* Gradient underline */}
        <div className="h-1 w-72 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
      </div>

      <PostEditor initialData={post} categories={categories} />
    </div>
  );
}
