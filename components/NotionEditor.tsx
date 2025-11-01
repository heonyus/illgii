'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NotionEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export default function NotionEditor({ initialContent = '', onChange }: NotionEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCursorPosition(e.target.selectionStart);
    onChange(newContent);
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const imageMarkdown = `![image](${base64})\n\n`;
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newContent = 
                content.substring(0, start) + 
                imageMarkdown + 
                content.substring(end);
              setContent(newContent);
              onChange(newContent);
              
              // 커서 위치 조정
              setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
              }, 0);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, [content, onChange]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const imageMarkdown = `![image](${base64})\n\n`;
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = 
              content.substring(0, start) + 
              imageMarkdown + 
              content.substring(end);
            setContent(newContent);
            onChange(newContent);
            
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
            }, 0);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }, [content, onChange]);

  // 동영상 URL 자동 감지 및 임베딩
  const processContent = (text: string) => {
    // YouTube URL 감지 및 변환
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    let processed = text.replace(youtubeRegex, (match, videoId) => {
      return `\n\n<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n\n`;
    });

    // 일반 비디오 URL 감지 (mp4, webm 등)
    const videoRegex = /(https?:\/\/[^\s]+\.(mp4|webm|ogg))/gi;
    processed = processed.replace(videoRegex, (match) => {
      const ext = match.split('.').pop()?.toLowerCase() || 'mp4';
      return `\n\n<video controls width="100%" class="my-4 rounded-lg"><source src="${match}" type="video/${ext}"></video>\n\n`;
    });

    return processed;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 실제 textarea (투명) */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onPaste={handlePaste}
        onDrop={handleDrop}
        placeholder="일기를 작성해주세요..."
        className="absolute inset-0 w-full resize-none bg-transparent p-0 font-sans text-lg leading-relaxed text-transparent caret-gray-900 dark:caret-gray-100 focus:outline-none"
        style={{ 
          zIndex: 2,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
        }}
      />
      
      {/* 렌더링된 마크다운 (에디터처럼 보이게) */}
      <div
        className="min-h-[500px] w-full rounded-lg border-0 bg-white dark:bg-[#0a0a0a] p-6 font-sans text-lg leading-relaxed text-gray-900 dark:text-gray-100 prose prose-lg max-w-none prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:mt-8 prose-headings:mb-4 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-900 dark:prose-p:text-gray-100 prose-p:leading-relaxed prose-p:my-4 prose-p:whitespace-pre-wrap prose-a:text-gray-900 dark:prose-a:text-gray-200 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-gray-600 dark:hover:prose-a:text-gray-400 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold prose-ul:text-gray-900 dark:prose-ul:text-gray-100 prose-ol:text-gray-900 dark:prose-ol:text-gray-100 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-300 prose-code:text-gray-900 dark:prose-code:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto"
        style={{ 
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        {content ? (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ src, alt }) => {
                if (typeof src === 'string' && src.startsWith('data:image')) {
                  return <img src={src} alt={alt || ''} className="my-4 max-w-full rounded-lg" />;
                }
                return <img src={typeof src === 'string' ? src : ''} alt={alt || ''} className="my-4 max-w-full rounded-lg" />;
              },
              p: ({ children, ...props }) => {
                // iframe이 포함된 경우 dangerouslySetInnerHTML 사용
                if (typeof children === 'string' && children.includes('<iframe')) {
                  return <div dangerouslySetInnerHTML={{ __html: children }} className="my-4" />;
                }
                // video 태그가 포함된 경우
                if (typeof children === 'string' && children.includes('<video')) {
                  return <div dangerouslySetInnerHTML={{ __html: children }} className="my-4" />;
                }
                return <p className="my-4" {...props}>{children}</p>;
              },
            }}
          >
            {processContent(content)}
          </ReactMarkdown>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">일기를 작성해주세요...</span>
        )}
      </div>
    </div>
  );
}

