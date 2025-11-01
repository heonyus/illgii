'use client';

import Image from 'next/image';

export default function Sidebar() {
  // 프로필 사진은 코드상에서 직접 설정
  // public 폴더에 profile.jpg 파일을 추가하거나, 아래 경로를 수정하세요
  const profileImage = '/profile.jpg';

  return (
    <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 border-r border-gray-100 bg-white p-6 overflow-y-auto">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-400">
            H
          </div>
        </div>
      </div>
    </aside>
  );
}
