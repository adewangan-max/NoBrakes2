import { getCategories } from '@/services/postService';
import { PostEditor } from '@/components/admin/PostEditor';
import {
  Sparkles,

} from "lucide-react";

export default async function NewPostPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={24} className="text-violet-400" />

          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Create New Post
          </h1>

          <span className="text-xl">✨</span>
        </div>

        {/* Gradient underline */}
        <div className="h-1 w-72 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
      </div>

      <PostEditor categories={categories} />
    </div>
  );
}
