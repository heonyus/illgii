'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import NotionEditor from '@/components/NotionEditor';
import { createDiary, saveDiary } from '@/lib/storage';
import { motion } from 'framer-motion';

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    const diary = createDiary(title, content);
    saveDiary(diary);
    
    setTimeout(() => {
      setIsSaving(false);
      router.push(`/diary/${diary.id}`);
    }, 300);
  };

  const handleCancel = () => {
    if (confirm('작성 중인 내용이 저장되지 않습니다. 정말 취소하시겠습니까?')) {
      router.push('/');
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full border-0 text-4xl font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none bg-transparent"
          />
        </div>

        <NotionEditor initialContent={content} onChange={setContent} />

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-gray-900 dark:bg-gray-100 px-6 py-3 text-sm font-medium text-white dark:text-gray-900 transition-all hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={handleCancel}
            className="rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95"
          >
            취소
          </button>
        </div>
      </motion.div>
    </Layout>
  );
}

