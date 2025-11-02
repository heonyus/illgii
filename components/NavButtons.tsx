'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Diary } from '@/lib/types';

interface NavButtonsProps {
  nextDiary: Diary | null;
  prevDiary: Diary | null;
}

export default function NavButtons({ nextDiary, prevDiary }: NavButtonsProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollBottom = scrollTop + windowHeight;

      // 페이지 끝에서 100px 이내에 있으면 표시
      if (documentHeight - scrollBottom < 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // 초기 체크

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!nextDiary && !prevDiary) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex gap-3 sm:gap-4 px-4 max-w-full"
        >
          {prevDiary && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/diary/${prevDiary.id}`)}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900/30 dark:bg-gray-800/30 backdrop-blur-md text-white rounded-full shadow-lg hover:bg-gray-800/50 dark:hover:bg-gray-700/50 transition-colors active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">이전글</span>
              <span className="text-xs text-gray-300 truncate max-w-[100px] sm:max-w-[150px]">
                {prevDiary.title}
              </span>
            </motion.button>
          )}

          {nextDiary && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/diary/${nextDiary.id}`)}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900/30 dark:bg-gray-800/30 backdrop-blur-md text-white rounded-full shadow-lg hover:bg-gray-800/50 dark:hover:bg-gray-700/50 transition-colors active:scale-95"
            >
              <span className="text-xs text-gray-300 truncate max-w-[100px] sm:max-w-[150px]">
                {nextDiary.title}
              </span>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">다음글</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

