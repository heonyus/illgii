'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="prose prose-lg max-w-none 
      prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:mt-8 prose-headings:mb-4 
      prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl 
      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4 
      prose-a:text-gray-900 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-gray-600 
      prose-strong:text-gray-900 prose-strong:font-semibold 
      prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:my-2 
      prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 
      prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm 
      prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

