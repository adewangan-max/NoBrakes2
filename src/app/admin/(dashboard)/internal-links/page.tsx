import { getLatestPosts } from "@/services/postService";
import InternalLinksManager from "@/components/admin/InternalLinksManager";

export default async function InternalLinksPage() {
  const posts = await getLatestPosts(200);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Internal Links</h1>
      {/* Client-side manager handles selection and linking */}
      <InternalLinksManager initialPosts={posts || []} />
    </div>
  );
}
