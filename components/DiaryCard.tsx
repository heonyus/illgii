'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Diary } from '@/lib/types';

interface DiaryCardProps {
  diary: Diary;
  index: number;
}

export default function DiaryCard({ diary, index }: DiaryCardProps) {
  const preview = diary.content.slice(0, 150).replace(/\n/g, ' ') + '...';
  const date = new Date(diary.updatedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/diary/${diary.id}`}>
        <article className="group cursor-pointer rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 transition-all duration-200 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-300 sm:text-2xl">
            {diary.title}
          </h2>
          <p className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed sm:text-base">
            {preview}
          </p>
          <time className="text-xs text-gray-400 dark:text-gray-500">{date}</time>
        </article>
      </Link>
    </motion.div>
  );
}

