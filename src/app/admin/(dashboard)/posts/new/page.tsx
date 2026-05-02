import { getCategories } from '@/services/postService';
import { PostEditor } from '@/components/admin/PostEditor';

export default async function NewPostPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white font-outfit">Create New Post</h1>
        <p className="text-slate-400 mt-1">Start writing your next high-ranking article.</p>
      </div>

      <PostEditor categories={categories} />
    </div>
  );
}
