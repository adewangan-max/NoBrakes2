import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface ContentRendererProps {
  content: string;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  return (
    <article className="prose prose-invert prose-indigo max-w-none 
      prose-headings:font-quantico prose-headings:font-bold prose-headings:text-white
      prose-p:text-slate-900 prose-p:leading-relaxed prose-p:text-lg
      prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-300
      prose-strong:text-white prose-code:text-indigo-300 prose-pre:bg-black/50
      prose-img:rounded-2xl prose-img:border prose-img:border-white/5"
    >
      <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
