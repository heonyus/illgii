import { getDiaryByIdFromFiles } from '@/lib/fileStorage';
import MarkdownViewer from '@/components/MarkdownViewer';
import Layout from '@/components/Layout';
import { notFound } from 'next/navigation';

export default async function DiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const diary = getDiaryByIdFromFiles(id);

  if (!diary) {
    notFound();
  }

  const date = new Date(diary.updatedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Layout>
      <article>
        <header className="mb-8 pb-8 border-b border-gray-100">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{diary.title}</h1>
          <time className="text-sm text-gray-500">{date}</time>
        </header>

        <div className="mb-8">
          <MarkdownViewer content={diary.content} />
        </div>
      </article>
    </Layout>
  );
}
