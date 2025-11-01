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
          <p className="text-gray-600">로딩 중...</p>
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
            className="w-full border-0 text-4xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        <NotionEditor initialContent={content} onChange={setContent} />

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={handleCancel}
            className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            className="rounded-full border border-red-200 bg-white px-6 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-95"
          >
            삭제
          </button>
        </div>
      </motion.div>
    </Layout>
  );
}

