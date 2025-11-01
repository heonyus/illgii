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
      className="relative flex gap-8 items-start"
    >
      {/* 타임라인 선과 날짜 영역 */}
      <div className="flex flex-col items-center shrink-0 relative min-h-full">
        {/* 날짜/요일 표시 - 카드 상단과 정렬 */}
        <div className="flex flex-col items-center mb-2">
          <div className="text-sm font-semibold text-gray-900">{String(date.getFullYear() % 100).padStart(2, '0')}.{String(date.getMonth() + 1).padStart(2, '0')}.{String(date.getDate()).padStart(2, '0')}</div>
          <div className="text-xs text-gray-500 mt-1">{dayOfWeek}</div>
        </div>
        
        {/* 타임라인 점 */}
        <div className="w-3 h-3 rounded-full bg-gray-900 border-2 border-white shadow-sm z-10 relative" />
        
        {/* 타임라인 선 - 다음 항목까지 이어지도록 */}
        {!isLast && (
          <div className="w-0.5 bg-gray-200 flex-1 mt-2 min-h-[200px]" />
        )}
      </div>

      {/* 일기 카드 (미디엄/브런치 스타일) */}
      <div className="flex-1 pb-0 -mt-1 -mb-12">
        <Link href={`/diary/${diary.id}`}>
          <article className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-8 transition-all duration-200 hover:border-gray-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] flex gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 transition-colors group-hover:text-gray-700 sm:text-3xl leading-tight">
                {diary.title}
              </h2>
              {preview && (
                <p className="text-gray-600 text-base leading-relaxed sm:text-lg">
                  {preview}
                </p>
              )}
            </div>
            {diary.image && (
              <div className="shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 relative rounded-lg overflow-hidden border border-gray-200">
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

