import { supabase } from '@/lib/supabase';

export interface InternalLinkResult {
  toPostId: string;
  anchorText: string;
}

export interface AutomationResult {
  categoryId?: string;
  tags: string[];
  contentWithInternalLinks: string;
  internalLinks: InternalLinkResult[];
  mediaUrls: string[];
}

export const automationService = {
  /** Main entry point for post automation */
  async automatePost(
    title: string,
    content: string,
    existingCategoryId?: string
  ): Promise<AutomationResult> {
    console.log('🤖 Starting automation for:', title);

    // 1. Auto-assign Category if missing
    let categoryId = existingCategoryId;
    if (!categoryId) {
      categoryId = await this.autoAssignCategory(title, content);
    }

    // 2. Auto-generate Tags
    const tags = this.autoGenerateTags(title, content);

    // 3. Auto-create Internal Links (returns modified content + structured link records)
    const { contentWithLinks, internalLinks } = await this.autoCreateInternalLinks(content);

    // 4. Auto-extract Media URLs from markdown/HTML content
    const mediaUrls = this.autoExtractMedia(content);

    return {
      categoryId,
      tags,
      contentWithInternalLinks: contentWithLinks,
      internalLinks,
      mediaUrls,
    };
  },

  /** Find the best matching category by scanning category names/slugs against content */
  async autoAssignCategory(title: string, content: string): Promise<string | undefined> {
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug');

    if (!categories || categories.length === 0) return undefined;

    const fullText = `${title} ${content}`.toLowerCase();

    const match = categories.find(
      (cat) =>
        fullText.includes(cat.name.toLowerCase()) ||
        fullText.includes(cat.slug.toLowerCase().replace(/-/g, ' '))
    );

    // Default to first category if no keyword match
    return match?.id ?? categories[0].id;
  },

  /** Generate up to 5 tags from high-frequency words in the content */
  autoGenerateTags(title: string, content: string): string[] {
    const stopWords = new Set([
      'with', 'this', 'that', 'from', 'they', 'have', 'will', 'been',
      'were', 'your', 'more', 'also', 'when', 'than', 'then', 'them',
      'some', 'what', 'into', 'over', 'such', 'like', 'just', 'very',
    ]);

    const text = `${title} ${content}`.toLowerCase();
    const words = text.match(/\b[a-z]{4,}\b/g) ?? [];

    const freq: Record<string, number> = {};
    for (const w of words) {
      if (!stopWords.has(w)) freq[w] = (freq[w] ?? 0) + 1;
    }

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  },

  /**
   * Scan existing posts and inject markdown links for any title matches in the content.
   * Also returns structured InternalLinkResult[] for storage in the internal_links table.
   */
  async autoCreateInternalLinks(content: string): Promise<{
    contentWithLinks: string;
    internalLinks: InternalLinkResult[];
  }> {
    const { data: otherPosts } = await supabase
      .from('posts')
      .select('id, title, slug')
      .eq('status', 'published')
      .limit(100);

    if (!otherPosts || otherPosts.length === 0) {
      return { contentWithLinks: content, internalLinks: [] };
    }

    let linkedContent = content;
    const internalLinks: InternalLinkResult[] = [];

    // Sort by title length desc — match longer phrases first to avoid partial overlaps
    const sorted = [...otherPosts].sort((a, b) => b.title.length - a.title.length);

    for (const post of sorted) {
      const escaped = post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<!\\[)\\b${escaped}\\b(?![^\\[]*\\])`, 'gi');

      let count = 0;
      linkedContent = linkedContent.replace(regex, (match) => {
        if (count === 0) {
          count++;
          internalLinks.push({ toPostId: post.id, anchorText: match });
          return `[${match}](/post/${post.slug})`;
        }
        return match;
      });
    }

    return { contentWithLinks: linkedContent, internalLinks };
  },

  /** Extract image URLs from markdown ![alt](url) syntax */
  autoExtractMedia(content: string): string[] {
    const regex = /!\[.*?\]\((.*?)\)/g;
    const urls: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      urls.push(match[1]);
    }
    return urls;
  },
};
