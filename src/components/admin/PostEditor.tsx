'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/types/database';
import { Save, Eye, Globe, Image as ImageIcon, CheckCircle, AlertCircle, Tag, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPostAction, updatePostAction } from '@/app/admin/(dashboard)/posts/actions';

interface PostEditorProps {
  initialData?: Partial<Post>;
  categories: { id: string; name: string; slug: string }[];
}

export function PostEditor({ initialData, categories }: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'media'>('content');

  const [formData, setFormData] = useState({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    content: initialData?.content ?? '',
    excerpt: initialData?.excerpt ?? '',
    status: initialData?.status ?? 'draft',
    category_id: initialData?.category_id ?? '',
    featured_image: initialData?.featured_image ?? '',
    featured_image_alt: initialData?.featured_image_alt ?? '',
    meta_title: initialData?.meta_title ?? '',
    meta_description: initialData?.meta_description ?? '',
    focus_keyword: initialData?.focus_keyword ?? '',
    canonical_url: initialData?.canonical_url ?? '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug from title (only for new posts)
    if (name === 'title' && !initialData?.id) {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        meta_title: prev.meta_title || value, // pre-fill meta title
      }));
    }
  };

  const handleSave = async (statusOverride?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      ...formData,
      status: (statusOverride ?? formData.status) as 'draft' | 'published' | 'archived',
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
        setTimeout(() => router.push('/admin/posts'), 1500);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all';

  const tabs = [
    { id: 'content', label: 'Content', icon: Save },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'media', label: 'Media & Tags', icon: Tag },
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ─── Left: Main Editor ─── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
            Post Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a compelling post title..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
            <LinkIcon className="w-3 h-3" /> URL Slug *
          </label>
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5">
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

        {/* Tab navigation for extra fields */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Content (Markdown)
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={20}
                placeholder="Write your content in Markdown...&#10;&#10;## Heading&#10;&#10;Paragraph text here. Add ![image](url) for media.&#10;&#10;Internal links to other posts will be auto-generated."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
              />
              <p className="text-[10px] text-slate-600 ml-1">
                🤖 Tags, internal links, and media will be auto-extracted on save.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                placeholder="Brief summary shown in post cards and search results..."
                className={cn(inputClass, 'resize-none')}
              />
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">SEO Metadata</h3>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Meta Title{' '}
                <span className={cn('ml-1', formData.meta_title.length > 60 ? 'text-red-400' : 'text-slate-600')}>
                  ({formData.meta_title.length}/60)
                </span>
              </label>
              <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="SEO Title (60 chars max)" className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Meta Description{' '}
                <span className={cn('ml-1', formData.meta_description.length > 160 ? 'text-red-400' : 'text-slate-600')}>
                  ({formData.meta_description.length}/160)
                </span>
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows={3}
                placeholder="Meta description (160 chars max)"
                className={cn(inputClass, 'resize-none')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Focus Keyword</label>
              <input type="text" name="focus_keyword" value={formData.focus_keyword} onChange={handleChange} placeholder="e.g. next.js seo guide" className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Canonical URL</label>
              <input type="text" name="canonical_url" value={formData.canonical_url} onChange={handleChange} placeholder="https://yourdomain.com/post/slug" className={inputClass} />
            </div>

            {/* SERP Preview */}
            {(formData.meta_title || formData.title) && (
              <div className="mt-4 p-4 rounded-xl bg-black/30 border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">SERP Preview</p>
                <p className="text-blue-400 text-base font-medium leading-tight line-clamp-1">
                  {formData.meta_title || formData.title}
                </p>
                <p className="text-green-600 text-xs mt-0.5">yourdomain.com/post/{formData.slug || 'slug'}</p>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                  {formData.meta_description || formData.excerpt || 'No description set.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Media & Tags Tab */}
        {activeTab === 'media' && (
          <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm">Media & Category</h3>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange} className={inputClass}>
                <option value="">Select Category (auto-assigned if blank)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Featured Image URL</label>
              <input type="url" name="featured_image" value={formData.featured_image} onChange={handleChange} placeholder="https://..." className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Featured Image Alt Text</label>
              <input type="text" name="featured_image_alt" value={formData.featured_image_alt} onChange={handleChange} placeholder="Describe the image for accessibility..." className={inputClass} />
            </div>

            {formData.featured_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.featured_image}
                alt={formData.featured_image_alt || 'Preview'}
                className="w-full h-48 object-cover rounded-xl border border-white/10 mt-2"
              />
            )}

            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-slate-400">
              <p className="font-bold text-indigo-400 mb-1">🤖 Auto-handled on save:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Tags extracted from content frequency analysis</li>
                <li>Internal links injected from matching post titles</li>
                <li>Inline images extracted and stored in post_media</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ─── Right: Actions Sidebar ─── */}
      <div className="space-y-6">
        {/* Publishing Card */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 sticky top-24">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Save className="w-4 h-4 text-indigo-400" />
            Publishing
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 disabled:opacity-50"
            >
              {loading && formData.status === 'draft' ? (
                <Spinner />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save as Draft
            </button>

            <button
              onClick={() => handleSave('published')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? <Spinner /> : <Eye className="w-4 h-4" />}
              Publish Post
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <CheckCircle className="w-4 h-4" />
              Post saved successfully!
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <h3 className="font-bold text-white text-sm">Content Summary</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Word count</span>
              <span className="text-white font-medium">
                {formData.content.split(/\s+/).filter(Boolean).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Characters</span>
              <span className="text-white font-medium">{formData.content.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Est. read time</span>
              <span className="text-white font-medium">
                {Math.ceil(formData.content.split(/\s+/).filter(Boolean).length / 200)} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
