import Link from 'next/link';
import { InternalLink } from '@/types/database';
import { Link as LinkIcon } from 'lucide-react';

interface InternalLinksProps {
  links: { anchor_text: string, posts: { id: string, slug: string, title: string } }[];
  isSidebar?: boolean;
}

export function InternalLinks({ links, isSidebar }: InternalLinksProps) {
  if (!links || links.length === 0) return null;

  if (isSidebar) {
    return (
      <div className="bg-gray-50 dark:bg-[#2d2e32] border border-gray-200 dark:border-[#3c4043] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Further Reading
          </h3>
        </div>
        <div className="flex flex-col gap-4">
          {links.map((link, idx) => (
            <Link
              key={idx}
              href={`/post/${link.posts.slug}`}
              className="flex items-start gap-3 group"
            >
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 group-hover:scale-125 transition-transform shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium leading-snug">
                {link.anchor_text}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-12 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6 text-indigo-400">
        <LinkIcon className="w-5 h-5" />
        <h3 className="text-xl font-bold text-white">Recommended Reading</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link, idx) => (
          <Link
            key={idx}
            href={`/post/${link.posts.slug}`}
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all group"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
            <span className="text-slate-300 group-hover:text-white transition-colors font-medium">
              {link.anchor_text}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

