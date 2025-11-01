'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import NotionEditor from '@/components/NotionEditor';
import { getDiaryById, saveDiary, deleteDiary } from '@/lib/storage';
import { Diary } from '@/lib/types';
import { motion } from 'framer-motion';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [diary, setDiary] = useState<Diary | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadedDiary = getDiaryById(id);
    if (!loadedDiary) {
      alert('일기를 찾을 수 없습니다.');
      router.push('/');
      return;
    }
    setDiary(loadedDiary);
    setTitle(loadedDiary.title);
    setContent(loadedDiary.content);
  }, [id, router]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (!diary) return;

    setIsSaving(true);
    const updatedDiary: Diary = {
      ...diary,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };
    saveDiary(updatedDiary);
    
    setTimeout(() => {
      setIsSaving(false);
      router.push(`/diary/${id}`);
    }, 300);
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteDiary(id);
      router.push('/');
    }
  };

  const handleCancel = () => {
    router.push(`/diary/${id}`);
  };

  if (!diary) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </Layout>
    );
  }

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
          <button
            onClick={handleDelete}
            className="rounded-full border border-red-200 dark:border-red-800 bg-white dark:bg-[#0a0a0a] px-6 py-3 text-sm font-medium text-red-600 dark:text-red-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95"
          >
            삭제
          </button>
        </div>
      </motion.div>
    </Layout>
  );
}

