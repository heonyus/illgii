'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { useMemo } from 'react';
import React from 'react';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  // 마크다운 내용 전처리: 빈 줄을 보존하면서 단일 줄바꿈만 <br>로 변환
  // 이미지 태그를 마크다운 이미지 문법으로 변환하여 파서가 제대로 처리하도록 함
  const processedContent = useMemo(() => {
    let processed = content;
    
    // HTML 이미지 태그를 마크다운 이미지 문법으로 변환
    // width 속성을 URL에 query parameter로 추가하여 유지
    processed = processed.replace(/<img\s+src="([^"]+)"\s+alt="([^"]*)"(?:\s+width="(\d+)")?\s*\/?>/g, (match, src, alt, width) => {
      // width 정보를 URL에 포함 (이미 query parameter가 있으면 &, 없으면 ? 추가)
      const separator = src.includes('?') ? '&' : '?';
      const srcWithWidth = width ? `${src}${separator}width=${width}` : src;
      return `\n\n![${alt || ''}](${srcWithWidth})\n\n`;
    });
    
    const lines = processed.split('\n');
    const processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      
      if (currentLine.trim() !== '') {
        processedLines.push(currentLine);
      } else {
        // 빈 줄을 보존하기 위해 마커 사용
        processedLines.push('\u200B\u200B');
      }
    }
    
    return processedLines.join('\n');
  }, [content]);

  return (
    <div className="prose prose-lg max-w-none 
      prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:mt-8 prose-headings:mb-4 
      prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl 
      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4 
      prose-a:text-gray-900 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-gray-600 
      prose-strong:text-gray-900 prose-strong:font-semibold 
      prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:my-2 
      prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm 
      prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          div: ({ children, className, ...props }) => {
            // 이미지 블록인 경우 이미지 컴포넌트로 처리
            if (className === 'image-block') {
              const childrenArray = React.Children.toArray(children);
              const imgElement = childrenArray.find(
                (child) => React.isValidElement(child) && child.type === 'img'
              ) as React.ReactElement<any> | undefined;
              
              if (imgElement && imgElement.props) {
                const { src, alt, width } = imgElement.props;
                const imgWidth = width ? (typeof width === 'string' ? parseInt(width, 10) : width) : undefined;
                
                return (
                  <figure className="my-6 flex flex-col items-center">
                    <img 
                      src={src} 
                      alt={alt || ''} 
                      width={imgWidth}
                      className="rounded-lg max-w-full h-auto"
                      style={imgWidth ? { width: `${imgWidth}px` } : {}}
                    />
                    {alt && (
                      <figcaption className="mt-2 text-sm text-gray-400 text-center">
                        {alt}
                      </figcaption>
                    )}
                  </figure>
                );
              }
            }
            return <div className={className} {...props}>{children}</div>;
          },
          img: ({ src, alt, ...props }: any) => {
            // URL에서 width query parameter 추출
            let imgWidth: number | undefined = undefined;
            let actualSrc = src;
            
            if (typeof src === 'string') {
              try {
                // 상대 URL인 경우 절대 URL로 변환
                const url = src.startsWith('http') ? new URL(src) : new URL(src, window.location.origin);
                const widthParam = url.searchParams.get('width');
                if (widthParam) {
                  imgWidth = parseInt(widthParam, 10);
                  // width parameter를 제거하여 실제 이미지 URL 유지
                  url.searchParams.delete('width');
                  actualSrc = src.startsWith('http') ? url.toString() : url.pathname + url.search;
                }
              } catch (e) {
                // URL 파싱 실패 시 원본 src 사용
                actualSrc = src;
              }
            }
            
            return (
              <figure className="my-6 flex flex-col items-center">
                <img 
                  src={actualSrc} 
                  alt={alt || ''} 
                  width={imgWidth}
                  className="rounded-lg max-w-full h-auto"
                  style={imgWidth ? { width: `${imgWidth}px` } : {}}
                />
                {alt && alt.trim() && (
                  <figcaption className="mt-2 text-sm text-gray-400 text-center">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },
          blockquote: ({ children, ...props }) => {
            return (
              <blockquote 
                className="my-6 border-l-2 border-gray-300 pl-6 italic text-gray-600"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          p: ({ children, ...props }) => {
            const childrenArray = React.Children.toArray(children);
            
            // figure 요소 찾기
            const figureElement = childrenArray.find(
              (child) => React.isValidElement(child) && child.type === 'figure'
            );
            
            // figure 요소가 있으면 figure만 렌더링
            if (figureElement) {
              return <>{figureElement}</>;
            }
            
            // 빈 단락 마커 확인
            if (!children) {
              return <p className="empty-paragraph" {...props}></p>;
            }
            
            const extractText = (node: any): string => {
              if (typeof node === 'string') return node;
              if (typeof node === 'number') return String(node);
              if (Array.isArray(node)) {
                return node.map(extractText).join('');
              }
              if (React.isValidElement(node)) {
                if (node.type === 'br' || node.type === 'figure') {
                  return '';
                }
                if (node.props?.children) {
                  return extractText(node.props.children);
                }
                return '';
              }
              return '';
            };
            
            const extractedText = extractText(children);
            const trimmed = extractedText.trim();
            
            if (trimmed === '\u200B\u200B' || trimmed === '') {
              return <p className="empty-paragraph" {...props}></p>;
            }
            
            return <p {...props}>{children}</p>;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

