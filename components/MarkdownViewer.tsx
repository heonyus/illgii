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

const EMPTY_PARAGRAPH_MARKER = '\u200B\u200B';
const CUSTOM_SEPARATOR_MARKER = '===';

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseYouTubeTimestamp(value: string | null): number | null {
  if (!value) {
    return null;
  }

  if (/^\d+$/.test(value)) {
    return parseInt(value, 10);
  }

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match) {
    return null;
  }

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  if (hours === 0 && minutes === 0 && seconds === 0) {
    return null;
  }

  return hours * 3600 + minutes * 60 + seconds;
}

function getYouTubeEmbedUrl(raw: string): string | null {
  if (!raw) {
    return null;
  }

  try {
    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw);
    const url = new URL(raw, hasProtocol ? undefined : 'https://www.youtube.com');
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    const params = new URLSearchParams(url.search);
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments.length === 0 && !params.size) {
      return null;
    }

    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (segments[0] === 'embed' && segments[1]) {
        return `${url.protocol}//${url.host}${url.pathname}${url.search}`;
      }
    }

    let videoId: string | null = null;

    if (host === 'youtu.be') {
      videoId = segments[0] || null;
    } else if (host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com')) {
      if (segments[0] === 'embed' && segments[1]) {
        return `${url.protocol}//${url.host}${url.pathname}${url.search}`;
      }
      if (!videoId) {
        const vParam = params.get('v');
        if (vParam) {
          videoId = vParam;
        }
      }
    } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (segments[0] === 'shorts' && segments[1]) {
        videoId = segments[1];
      } else if (segments[0] === 'live' && segments[1]) {
        videoId = segments[1];
      } else {
        const vParam = params.get('v');
        if (vParam) {
          videoId = vParam;
        }
      }
    } else if (host.endsWith('youtube.com')) {
      const vParam = params.get('v');
      if (vParam) {
        videoId = vParam;
      }
    } else {
      return null;
    }

    if (!videoId) {
      return null;
    }

    const embedParams = new URLSearchParams();
    const start = parseYouTubeTimestamp(params.get('t'));
    if (start !== null) {
      embedParams.set('start', start.toString());
    } else if (params.get('start') && /^\d+$/.test(params.get('start')!)) {
      embedParams.set('start', params.get('start')!);
    }

    if (params.get('end') && /^\d+$/.test(params.get('end')!)) {
      embedParams.set('end', params.get('end')!);
    }

    for (const [key, value] of params.entries()) {
      if (key === 'v' || key === 't' || key === 'start' || key === 'end') {
        continue;
      }
      embedParams.append(key, value);
    }

    const baseHost = host.includes('youtube-nocookie.com')
      ? 'https://www.youtube-nocookie.com'
      : 'https://www.youtube.com';

    const query = embedParams.toString();
    return `${baseHost}/embed/${videoId}${query ? `?${query}` : ''}`;
  } catch (error) {
    return null;
  }
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  // 마크다운 내용 전처리: 빈 줄을 보존하면서 단일 줄바꿈만 <br>로 변환
  // 이미지 태그를 마크다운 이미지 문법으로 변환하여 파서가 제대로 처리하도록 함
  const processedContent = useMemo(() => {
    let processed = content;

    // HTML 이미지 태그를 마크다운 이미지 문법으로 변환
    // width 속성을 URL에 query parameter로 추가하여 유지
    // 이미지가 인라인으로 처리되어 간격 없이 텍스트와 붙어있도록 변환
    processed = processed.replace(/<img\s+src="([^"]+)"\s+alt="([^"]*)"(?:\s+width="(\d+)")?\s*\/?>/g, (match, src, alt, width) => {
      // width 정보를 URL에 포함 (이미 query parameter가 있으면 &, 없으면 ? 추가)
      const separator = src.includes('?') ? '&' : '?';
      const srcWithWidth = width ? `${src}${separator}width=${width}` : src;
      return `![${alt || ''}](${srcWithWidth})`;
    });
    
    const lines = processed.split('\n');
    const processedLines: string[] = [];
    let expectPlainEmptyLine = false;
    
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      const trimmedLine = currentLine.trim();
      const isEmptyLine = trimmedLine === '';

      if (expectPlainEmptyLine && !isEmptyLine) {
        processedLines.push('');
        expectPlainEmptyLine = false;
      }

      // 단독 유튜브 URL 라인은 임베드 블록으로 변환
      if (!isEmptyLine) {
        const embedUrl = getYouTubeEmbedUrl(trimmedLine);
        if (embedUrl) {
          if (processedLines.length > 0) {
            const last = processedLines[processedLines.length - 1];
            if (last === EMPTY_PARAGRAPH_MARKER) {
              processedLines[processedLines.length - 1] = '';
            } else if (last !== '') {
              processedLines.push('');
            }
          }
          processedLines.push(`<div class="youtube-embed" data-src="${escapeHtmlAttribute(embedUrl)}"></div>`);
          expectPlainEmptyLine = true;
          continue;
        }

        if (trimmedLine === CUSTOM_SEPARATOR_MARKER) {
          if (processedLines.length > 0) {
            const last = processedLines[processedLines.length - 1];
            if (last === EMPTY_PARAGRAPH_MARKER) {
              processedLines[processedLines.length - 1] = '';
            } else if (last !== '') {
              processedLines.push('');
            }
          }
          processedLines.push('<div class="diary-separator"></div>');
          expectPlainEmptyLine = true;
          continue;
        }
      } else if (expectPlainEmptyLine) {
        processedLines.push('');
        expectPlainEmptyLine = false;
        continue;
      }
      
      const prevLine = i > 0 ? lines[i - 1] : '';
      
      // 이전 라인이 블록 인용인지 확인
      const prevIsBlockquote = prevLine.trim().startsWith('>');
      
      // 다음 라인이 일반 텍스트인지 확인 (블록 인용, 헤딩, 리스트, 코드 블록 등이 아닌 경우)
      const isNextLinePlainText = i < lines.length - 1 && 
        lines[i + 1].trim() !== '' && 
        !lines[i + 1].trim().startsWith('>') &&
        !lines[i + 1].trim().startsWith('#') &&
        !lines[i + 1].trim().startsWith('-') &&
        !lines[i + 1].trim().startsWith('*') &&
        !lines[i + 1].trim().startsWith('```') &&
        !lines[i + 1].trim().startsWith('<') &&
        !lines[i + 1].trim().match(/^\d+\./); // 숫자 리스트도 제외
      
      // 블록 인용 다음에 빈 줄이 있고, 그 다음 일반 텍스트가 오는 경우
      // 블록 인용이 끝나도록 명확히 구분하기 위해 실제 빈 줄로 유지
      if (prevIsBlockquote && isEmptyLine && isNextLinePlainText) {
        processedLines.push('');
        expectPlainEmptyLine = false;
        continue;
      }
      
      if (!isEmptyLine) {
        processedLines.push(currentLine);
      } else {
        // 빈 줄을 보존하기 위해 마커 사용
        processedLines.push(EMPTY_PARAGRAPH_MARKER);
        expectPlainEmptyLine = false;
      }
    }
    
    return processedLines.join('\n');
  }, [content]);

  return (
    <div 
      className="prose prose-lg max-w-none 
      prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:mt-8 prose-headings:mb-4 
      prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl 
      prose-p:text-black dark:prose-p:text-white prose-p:leading-relaxed prose-p:my-4 
      prose-a:text-gray-900 dark:prose-a:text-gray-200 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-gray-700 dark:hover:prose-a:text-gray-300 
      prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold 
      prose-ul:text-gray-700 dark:prose-ul:text-white prose-ol:text-gray-700 dark:prose-ol:text-white prose-li:my-2 
      prose-code:text-gray-900 dark:prose-code:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm 
      prose-pre:bg-gray-100 dark:prose-pre:bg-gray-950 prose-pre:text-gray-900 dark:prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
      prose-blockquote:before:content-none prose-blockquote:after:content-none
      dark:prose-blockquote:text-gray-200 dark:prose-blockquote:border-gray-700 dark:prose-blockquote:bg-gray-800/30
      prose-figure:my-0 prose-figure:!mt-0 prose-figure:!mb-0
      [&_p+figure]:!mt-0 [&_figure+p]:!mt-0 [&_figure+p]:!mb-0
      [&_p:has(figure)]:!my-0 [&_p:has(img)]:!my-0"
      style={{
        '--tw-prose-body': '#000000',
        '--tw-prose-p': '#000000',
      } as React.CSSProperties}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          iframe: ({ src, allow, allowFullScreen, className, ...props }: any) => {
            const rawSrc = typeof src === 'string' ? src : '';
            const embedSrc = getYouTubeEmbedUrl(rawSrc) || rawSrc;

            return (
              <div className="my-4 w-full overflow-hidden rounded-lg">
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={embedSrc}
                    className={`absolute left-0 top-0 h-full w-full${className ? ` ${className}` : ''}`}
                    loading="lazy"
                    title="Embedded video"
                    allow={allow || 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'}
                    allowFullScreen={allowFullScreen ?? true}
                    frameBorder={0}
                    {...props}
                  />
                </div>
              </div>
            );
          },
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
                  <figure className="my-0 !mt-0 !mb-0 flex flex-col items-center [&+p]:!mt-0 [&+*]:!mt-0">
                    <img 
                      src={src} 
                      alt={alt || ''} 
                      width={imgWidth}
                      className="rounded-lg max-w-full h-auto"
                      style={imgWidth ? { width: `${imgWidth}px` } : {}}
                    />
                    {alt && (
                      <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                        {alt}
                      </figcaption>
                    )}
                  </figure>
                );
              }
            }
            // 유튜브 임베드 컨테이너 처리 (raw HTML 사용 시)
            if (className && className.split(' ').includes('youtube-embed')) {
              const dataSrc = (props as any)['data-src'] as string | undefined;
              const id = (props as any)['data-id'] as string | undefined;
              const title = (props as any)['data-title'] as string | undefined;
              const embedUrl = dataSrc || (id ? `https://www.youtube.com/embed/${id}` : undefined);
              const extraClasses = className
                .split(' ')
                .filter((token) => token && token !== 'youtube-embed')
                .join(' ');

              if (embedUrl) {
                return (
                  <div className={`my-4 w-full overflow-hidden rounded-lg${extraClasses ? ` ${extraClasses}` : ''}`}>
                    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                      <iframe
                        src={embedUrl}
                        className="absolute left-0 top-0 h-full w-full"
                        loading="lazy"
                        title={title || 'YouTube video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              }
            }
            if (className && className.split(' ').includes('diary-separator')) {
              const extraClasses = className
                .split(' ')
                .filter((token) => token && token !== 'diary-separator')
                .join(' ');

              return (
                <div className={`my-8 flex w-full justify-center${extraClasses ? ` ${extraClasses}` : ''}`}>
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                    <span className="block h-2.5 w-2.5 rounded-full border border-current"></span>
                    <div className="h-px w-[500px] max-w-full bg-gray-300 dark:bg-gray-700"></div>
                    <span className="block h-2.5 w-2.5 rounded-full border border-current"></span>
                  </div>
                </div>
              );
            }
            return <div className={className} {...props}>{children}</div>;
          },
          img: ({ src, alt, className, ...props }: any) => {
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
              <figure className="my-0 !mt-0 !mb-0 flex flex-col items-center [&+p]:!mt-0 [&+*]:!mt-0">
                <img 
                  src={actualSrc} 
                  alt={alt || ''} 
                  width={imgWidth}
                  className={`rounded-lg max-w-full h-auto${className ? ` ${className}` : ''}`}
                  style={imgWidth ? { width: `${imgWidth}px` } : {}}
                  {...props}
                />
                {alt && alt.trim() && (
                  <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },
          blockquote: ({ children, className, ...props }) => {
            return (
              <blockquote 
                className={`my-2 border-l-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 rounded-r-md py-2 px-4 text-gray-700 dark:text-gray-200 not-italic [&::before]:content-none [&::after]:content-none [&_p::before]:content-none [&_p::after]:content-none [&_p]:my-0 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0${className ? ` ${className}` : ''}`}
                style={{
                  ['--tw-content']: 'none',
                } as React.CSSProperties}
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          p: ({ children, className, ...props }) => {
            // 재귀적으로 figure나 img 요소를 찾는 함수
            const findBlockElement = (node: any): boolean => {
              if (React.isValidElement(node)) {
                const nodeType = node.type;
                const nodeProps = (node.props as any);
                
                // figure나 img 요소를 직접 찾기
                if (nodeType === 'figure' || nodeType === 'img') {
                  return true;
                }
                
                // img 컴포넌트 함수를 찾기 (다양한 형태 확인)
                if (typeof nodeType === 'function') {
                  const funcName = nodeType.name || (nodeType as any).displayName;
                  if (funcName === 'img' || funcName === 'Img') {
                    return true;
                  }
                }
                
                // props에서 img 관련 속성 확인 (src 또는 alt가 있으면 img로 간주)
                if (nodeProps && (nodeProps.src || (nodeProps.alt !== undefined && nodeProps.alt !== null))) {
                  return true;
                }
                
                // children 재귀 검색
                if (nodeProps?.children) {
                  const childrenArray = React.Children.toArray(nodeProps.children);
                  return childrenArray.some(findBlockElement);
                }
              }
              if (Array.isArray(node)) {
                return node.some(findBlockElement);
              }
              return false;
            };
            
            const childrenArray = React.Children.toArray(children);
            const hasBlockElement = childrenArray.some(findBlockElement);
            
            // figure나 img 요소가 있으면 p 태그로 감싸지 않고 Fragment로 반환
            // margin을 제거하기 위해 클래스 추가
            if (hasBlockElement) {
              const combinedClassName = className ? `!my-0 ${className}` : '!my-0';
              return <div className={combinedClassName} {...props}>{children}</div>;
            }
            
            // 빈 단락 마커 확인
            if (!children) {
              const paragraphClassNames = ['empty-paragraph', '!text-black', 'dark:!text-gray-100'];
              if (className) {
                paragraphClassNames.push(className);
              }
              return <p className={paragraphClassNames.join(' ')} {...props}></p>;
            }
            
            const extractText = (node: any): string => {
              if (typeof node === 'string') return node;
              if (typeof node === 'number') return String(node);
              if (Array.isArray(node)) {
                return node.map(extractText).join('');
              }
              if (React.isValidElement(node)) {
                if (node.type === 'br' || node.type === 'figure' || node.type === 'img') {
                  return '';
                }
                if ((node.props as any)?.children) {
                  return extractText((node.props as any).children);
                }
                return '';
              }
              return '';
            };
            
            const extractedText = extractText(children);
            const trimmed = extractedText.trim();
            
            if (trimmed === EMPTY_PARAGRAPH_MARKER || trimmed === '') {
              const emptyClassNames = ['empty-paragraph'];
              if (className) {
                emptyClassNames.push(className);
              }
              return <p className={emptyClassNames.join(' ')} {...props}></p>;
            }
            
            const paragraphClassNames = ['!text-black', 'dark:!text-gray-100'];
            if (className) {
              paragraphClassNames.push(className);
            }
            
            return (
              <p 
                className={paragraphClassNames.join(' ')} 
                style={{ color: '#000000' }}
                {...props}
              >
                {children}
              </p>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
