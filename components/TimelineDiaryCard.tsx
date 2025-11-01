'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Diary } from '@/lib/types';

interface TimelineDiaryCardProps {
  diary: Diary;
  index: number;
  isLast?: boolean;
}

export default function TimelineDiaryCard({ diary, index, isLast = false }: TimelineDiaryCardProps) {
  const preview = diary.content.slice(0, 200).replace(/\n/g, ' ') + '...';
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
      className="relative flex gap-8"
    >
      {/* 타임라인 선과 날짜 영역 */}
      <div className="flex flex-col items-center shrink-0">
        {/* 날짜/요일 표시 */}
        <div className="flex flex-col items-center mb-4">
          <div className="text-sm font-semibold text-gray-900">{date.getDate()}</div>
          <div className="text-xs text-gray-500 mt-1">{dayOfWeek}</div>
        </div>
        
        {/* 타임라인 점 */}
        <div className="w-3 h-3 rounded-full bg-gray-900 border-2 border-white shadow-sm z-10" />
        
        {/* 타임라인 선 */}
        {!isLast && (
          <div className="w-0.5 h-full bg-gray-200 mt-2" />
        )}
      </div>

      {/* 일기 카드 (미디엄/브런치 스타일) */}
      <div className="flex-1 pb-12">
        <Link href={`/diary/${diary.id}`}>
          <article className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-8 transition-all duration-200 hover:border-gray-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 transition-colors group-hover:text-gray-700 sm:text-3xl leading-tight">
              {diary.title}
            </h2>
            <p className="mb-6 line-clamp-3 text-gray-600 text-base leading-relaxed sm:text-lg">
              {preview}
            </p>
            <time className="text-xs text-gray-400 font-medium">{dateString}</time>
          </article>
        </Link>
      </div>
    </motion.div>
  );
}

