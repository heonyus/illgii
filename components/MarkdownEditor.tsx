'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export default function MarkdownEditor({ initialContent = '', onChange }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col">
        <label className="mb-2 text-sm font-medium text-gray-700">마크다운 편집</label>
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="일기를 작성해주세요..."
          className="min-h-[400px] w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm leading-relaxed text-gray-900 transition-all focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:min-h-[500px]"
        />
      </div>
      <div className="flex flex-col lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)]">
        <label className="mb-2 text-sm font-medium text-gray-700">미리보기</label>
        <div className="min-h-[400px] w-full flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:mt-4 prose-headings:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-3 prose-a:text-gray-900 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-gray-600 prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto sm:min-h-[500px]">
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <p className="text-gray-400">미리보기가 여기에 표시됩니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

