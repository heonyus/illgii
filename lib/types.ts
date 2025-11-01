export interface Diary {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
}

export interface DiaryFormData {
  title: string;
  content: string;
}

