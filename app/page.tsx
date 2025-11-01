import { getAllDiariesFromFiles, getDiaryByIdFromFiles } from '@/lib/fileStorage';
import { Diary } from '@/lib/types';
import TimelineDiaryCard from '@/components/TimelineDiaryCard';
import Layout from '@/components/Layout';

export default function HomePage() {
  const diaries = getAllDiariesFromFiles();

  return (
    <Layout>
      {diaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 sm:text-3xl">아직 일기가 없습니다</h2>
          <p className="mb-8 text-gray-600 sm:text-lg">diaries 폴더에 마크다운 파일을 추가해주세요.</p>
        </div>
      ) : (
        <div className="space-y-0">
          {diaries.map((diary, index) => (
            <TimelineDiaryCard 
              key={diary.id} 
              diary={diary} 
              index={index}
              isLast={index === diaries.length - 1}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
