import { Diary } from './types';

const STORAGE_KEY = 'illgii_diaries';

export function getAllDiaries(): Diary[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Diary[];
  } catch (error) {
    console.error('Failed to load diaries:', error);
    return [];
  }
}

export function getDiaryById(id: string): Diary | null {
  const diaries = getAllDiaries();
  return diaries.find(diary => diary.id === id) || null;
}

export function saveDiary(diary: Diary): void {
  if (typeof window === 'undefined') return;
  
  try {
    const diaries = getAllDiaries();
    const existingIndex = diaries.findIndex(d => d.id === diary.id);
    
    if (existingIndex >= 0) {
      diaries[existingIndex] = diary;
    } else {
      diaries.push(diary);
    }
    
    // 최신순으로 정렬
    diaries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diaries));
  } catch (error) {
    console.error('Failed to save diary:', error);
  }
}

export function deleteDiary(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const diaries = getAllDiaries();
    const filtered = diaries.filter(diary => diary.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete diary:', error);
  }
}

export function createDiary(title: string, content: string): Diary {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };
}

