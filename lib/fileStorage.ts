// 파일 시스템에서 일기를 읽어오는 유틸리티
import { Diary } from './types';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const diariesDirectory = path.join(process.cwd(), 'diaries');

export function getAllDiariesFromFiles(): Diary[] {
  try {
    if (!fs.existsSync(diariesDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(diariesDirectory);
    const allDiaries = fileNames
      .filter((name) => name.endsWith('.md'))
      .map((fileName) => {
        const fullPath = path.join(diariesDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          id: fileName.replace(/\.md$/, ''),
          title: data.title || 'Untitled',
          content: content,
          createdAt: data.date || new Date().toISOString(),
          updatedAt: data.date || new Date().toISOString(),
          image: data.image || undefined,
        };
      })
      .sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

    return allDiaries;
  } catch (error) {
    console.error('Failed to read diaries:', error);
    return [];
  }
}

export function getDiaryByIdFromFiles(id: string): Diary | null {
  try {
    const fullPath = path.join(diariesDirectory, `${id}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      id: id,
      title: data.title || 'Untitled',
      content: content,
      createdAt: data.date || new Date().toISOString(),
      updatedAt: data.date || new Date().toISOString(),
      image: data.image || undefined,
    };
  } catch (error) {
    console.error('Failed to read diary:', error);
    return null;
  }
}

export function getNextAndPrevDiary(id: string): { next: Diary | null; prev: Diary | null } {
  const allDiaries = getAllDiariesFromFiles();
  const currentIndex = allDiaries.findIndex((diary) => diary.id === id);

  if (currentIndex === -1) {
    return { next: null, prev: null };
  }

  const next = currentIndex > 0 ? allDiaries[currentIndex - 1] : null;
  const prev = currentIndex < allDiaries.length - 1 ? allDiaries[currentIndex + 1] : null;

  return { next, prev };
}

