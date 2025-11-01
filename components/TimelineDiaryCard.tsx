'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Diary } from '@/lib/types';

interface TimelineDiaryCardProps {
  diary: Diary;
  index: number;
  isLast?: boolean;
}

export default function TimelineDiaryCard({ diary, index, isLast = false }: TimelineDiaryCardProps) {
  // 첫 줄만 추출 (빈 줄 제외)
  const firstLine = diary.content
    .split('\n')
    .find(line => line.trim().length > 0) || diary.content.split('\n')[0] || '';
  const preview = firstLine.trim();
  
  const date = new Date(diary.updatedAt);
  
  const dateString = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const dayOfWeek = date.toLocaleDateString('ko-KR', {
    weekday: 'long',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative flex gap-4 sm:gap-6 md:gap-8 items-start"
    >
      {/* 타임라인 선과 날짜 영역 */}
      <div className="flex flex-col items-center shrink-0 relative">
        {/* 위쪽 타임라인 선 (절대 위치 - 위쪽 노드 위에서만, 날짜 영역을 가로지르지 않음) */}
        {/* 구조: 이전 선 → 위쪽 점 → 날짜/요일 → 아래쪽 점 → 아래쪽 선 */}
        {index > 0 && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"
            style={{ 
              height: 'calc(2rem - 0.75rem)',  // 이전 항목의 선 끝부터 위쪽 노드까지
              top: '-2rem'  // 이전 항목의 아래쪽 선이 이어지는 위치
            }}
          />
        )}
        
        {/* 위쪽 노드 (절대 위치 - 선의 끝에 위치, 날짜 위에) */}
        {index > 0 && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-800 dark:bg-white border-2 border-white dark:border-[#0a0a0a] shadow-sm z-10"
            style={{ top: '-0.75rem' }}
          />
        )}
        
        {/* 날짜/요일 표시 - 항상 동일한 위치에 고정 (카드와 정렬 유지) */}
        <div className="flex flex-col items-center mb-3 relative z-10">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{String(date.getFullYear() % 100).padStart(2, '0')}.{String(date.getMonth() + 1).padStart(2, '0')}.{String(date.getDate()).padStart(2, '0')}</div>
          <div className="text-xs text-gray-800 dark:text-white mt-1">{dayOfWeek}</div>
        </div>
        
        {/* 아래쪽 타임라인 점 - 날짜/요일 아래에 위치 (마지막 항목이 아닌 경우만) */}
        {!isLast && (
          <div className="w-3 h-3 rounded-full bg-gray-800 dark:bg-white border-2 border-white dark:border-[#0a0a0a] shadow-sm z-10 relative" />
        )}
        
        {/* 타임라인 선 - 다음 항목까지 이어지도록 */}
        {!isLast && (
          <div className="w-0.5 bg-gray-200 dark:bg-gray-700 mt-2 flex-1 min-h-[8rem] sm:min-h-[10rem] md:min-h-[12rem]" />
        )}
      </div>

      {/* 일기 카드 (미디엄/브런치 스타일) */}
      <div className="flex-1 pb-8 sm:pb-10 md:pb-12">
        <Link href={`/diary/${diary.id}`}>
          <article className="group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] flex gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-300 sm:text-3xl leading-tight">
                {diary.title}
              </h2>
              {preview && (
                <p className="text-gray-700 dark:text-white text-base leading-relaxed sm:text-lg line-clamp-2 sm:line-clamp-3">
                  {preview}
                </p>
              )}
            </div>
            {diary.image && (
              <div className="shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Image
                    src={diary.image}
                    alt={diary.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, 128px"
                    suppressHydrationWarning
                  />
                </div>
              </div>
            )}
          </article>
        </Link>
      </div>
    </motion.div>
  );
}

