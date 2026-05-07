"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/types/database";
import {
  Save,
  Eye,
  Globe,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Tag,
  Link as LinkIcon,
  Sparkles,
  ArrowLeft,
  FileText,
  Clock,
  Calendar,
  TrendingUp,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createPostAction,
  updatePostAction,
} from "@/app/admin/(dashboard)/posts/actions";

interface PostEditorProps {
  initialData?: Partial<Post>;
  categories?: { id: string; name: string; slug: string }[];
}

export function PostEditor({ initialData, categories }: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "media">(
    "content",
  );
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    content: initialData?.content ?? "",
    excerpt: initialData?.excerpt ?? "",
    status: initialData?.status ?? "draft",
    category_id: initialData?.category_id ?? "",
    featured_image: initialData?.featured_image ?? "",
    featured_image_alt: initialData?.featured_image_alt ?? "",
    meta_title: initialData?.meta_title ?? "",
    meta_description: initialData?.meta_description ?? "",
    focus_keyword: initialData?.focus_keyword ?? "",
    canonical_url: initialData?.canonical_url ?? "",
  });

  const [categoriesList, setCategoriesList] = useState<
    { id: string; name: string; slug: string }[]
  >(categories || []);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && Array.isArray(data)) setCategoriesList(data);
      } catch (err) {
        // ignore — categories are optional
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug from title (only for new posts)
    if (name === "title" && !initialData?.id) {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        meta_title: prev.meta_title || value,
      }));
    }
  };

  const handleSave = async (statusOverride?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      ...formData,
      status: (statusOverride ?? formData.status) as
        | "draft"
        | "published"
        | "archived",
    };

    try {
      if (initialData?.id) {
        const result = await updatePostAction(initialData.id, payload);
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await createPostAction(payload);
        if (!result.success) throw new Error(result.error);
      }

      setSuccess(true);
      if (!initialData?.id) {
        setTimeout(() => router.push("/admin/posts"), 1500);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";

  const tabs = [
    { id: "content", label: "Content", icon: FileText, gradient: "from-emerald-500 to-emerald-400" },
    { id: "seo", label: "SEO", icon: Globe, gradient: "from-indigo-500 to-indigo-400" },
    { id: "media", label: "Media & Tags", icon: Tag, gradient: "from-purple-500 to-purple-400" },
  ] as const;

  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Left: Main Editor ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 hover:border-indigo-500/20 transition-all duration-500">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={12} />
                  Post Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a compelling post title..."
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                />
                <p className="text-[10px] text-slate-500 ml-1">
                  {formData.title.length} characters — Keep it under 60 characters for best SEO
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <LinkIcon size={12} />
                  URL Slug *
                </label>
                <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                  <span className="text-slate-600 text-sm shrink-0">/post/</span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="post-url-slug"
                    className="flex-1 bg-transparent text-sm text-slate-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/10",
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={12} />
                    Content (Markdown)
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={20}
                    placeholder={`Write your content in Markdown...

## Heading

Paragraph text here. Add ![image](url) for media.

Internal links to other posts will be auto-generated.`}
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-6 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>🤖 Tags, internal links, and media will be auto-extracted on save</span>
                    <span className="flex items-center gap-2">
                      <span>📝 {wordCount} words</span>
                      <span>⏱️ {readTime} min read</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Excerpt</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief summary shown in post cards and search results..."
                    className={cn(inputClass, "resize-none")}
                  />
                  <p className="text-[10px] text-slate-500">
                    {formData.excerpt.length} characters — Recommended: 150-160 characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-base">SEO Metadata</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Meta Title{" "}
                      <span
                        className={cn(
                          "ml-1",
                          formData.meta_title.length > 60
                            ? "text-red-400"
                            : "text-emerald-400",
                        )}
                      >
                        ({formData.meta_title.length}/60)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      placeholder="SEO Title (60 chars max)"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Meta Description{" "}
                      <span
                        className={cn(
                          "ml-1",
                          formData.meta_description.length > 160
                            ? "text-red-400"
                            : "text-emerald-400",
                        )}
                      >
                        ({formData.meta_description.length}/160)
                      </span>
                    </label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Meta description (160 chars max)"
                      className={cn(inputClass, "resize-none")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Focus Keyword
                      </label>
                      <input
                        type="text"
                        name="focus_keyword"
                        value={formData.focus_keyword}
                        onChange={handleChange}
                        placeholder="e.g. next.js seo guide"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Canonical URL
                      </label>
                      <input
                        type="text"
                        name="canonical_url"
                        value={formData.canonical_url}
                        onChange={handleChange}
                        placeholder="https://yourdomain.com/post/slug"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* SERP Preview */}
                  {(formData.meta_title || formData.title) && (
                    <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Eye size={10} />
                        Google SERP Preview
                      </p>
                      <p className="text-blue-400 text-base font-medium leading-tight line-clamp-1">
                        {formData.meta_title || formData.title}
                      </p>
                      <p className="text-emerald-500 text-xs mt-0.5">
                        yourdomain.com/post/{formData.slug || "slug"}
                      </p>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                        {formData.meta_description ||
                          formData.excerpt ||
                          "No description set."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Media & Tags Tab */}
          {activeTab === "media" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm border border-purple-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-base">Media & Category</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select a category</option>
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Create new category..."
                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const name = newCategoryName.trim();
                          if (!name) return;
                          try {
                            setCreatingCategory(true);
                            const res = await fetch("/api/categories", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ name }),
                            });
                            if (!res.ok) throw new Error("Failed to create");
                            const created = await res.json();
                            if (created && created.id) {
                              setCategoriesList((prev) => [created, ...prev]);
                              setFormData((prev) => ({
                                ...prev,
                                category_id: created.id,
                              }));
                              setNewCategoryName("");
                            }
                          } catch (err) {
                            console.error("Create category error", err);
                          } finally {
                            setCreatingCategory(false);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium transition-all disabled:opacity-50"
                        disabled={creatingCategory}
                      >
                        {creatingCategory ? "Creating..." : <Plus size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      name="featured_image"
                      value={formData.featured_image}
                      onChange={handleChange}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Alt Text (SEO)
                    </label>
                    <input
                      type="text"
                      name="featured_image_alt"
                      value={formData.featured_image_alt}
                      onChange={handleChange}
                      placeholder="Describe the image for accessibility..."
                      className={inputClass}
                    />
                  </div>

                  {formData.featured_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.featured_image}
                      alt={formData.featured_image_alt || "Preview"}
                      className="w-full h-48 object-cover rounded-xl border border-white/10 mt-2"
                    />
                  )}

                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300">
                    <p className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
                      <Sparkles size={12} />
                      🤖 Auto-handled on save:
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-slate-400">
                      <li>Tags extracted from content frequency analysis</li>
                      <li>Internal links injected from matching post titles</li>
                      <li>Inline images extracted and stored in post_media</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Actions Sidebar ─── */}
        <div className="space-y-6">
          {/* Publishing Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 hover:border-indigo-500/20 transition-all duration-500 sticky top-24">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <Save className="w-4 h-4 text-white" />
              </div>
              Publishing
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={10} />
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="draft">📝 Draft</option>
                  <option value="published">🚀 Published</option>
                  <option value="archived">📦 Archived</option>
                </select>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  onClick={() => handleSave("draft")}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all duration-300 border border-white/10 disabled:opacity-50 group"
                >
                  {loading && formData.status === "draft" ? (
                    <Spinner />
                  ) : (
                    <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  )}
                  Save as Draft
                </button>

                <button
                  onClick={() => handleSave("published")}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 group"
                >
                  {loading ? <Spinner /> : <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  Publish Post
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-in slide-in-from-top-2">
                  <CheckCircle className="w-4 h-4" />
                  Post saved successfully! {!initialData?.id && "Redirecting..."}
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" />
              Content Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-500">Word count</span>
                <span className="text-white font-bold text-lg">{wordCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-500">Characters</span>
                <span className="text-white font-bold text-lg">{formData.content.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Est. read time</span>
                <span className="text-white font-bold text-lg">
                  {readTime} min
                </span>
              </div>
            </div>
            {formData.focus_keyword && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Tag size={10} />
                  Focus Keyword: <span className="text-emerald-400">{formData.focus_keyword}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}