'use client';
import { useState, createContext } from 'react';
import ProfileMenu from '@/components/profile/ProfileMenu';

export const ProfileMobileContext = createContext<{ onCancel: () => void } | null>(null);

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className='mx-auto flex min-h-screen max-w-375 flex-col items-center gap-8 bg-white px-4 py-10 md:max-w-744 md:flex-row md:items-start md:justify-center md:gap-12 md:px-8 lg:max-w-7xl lg:px-16'>
      {/* 모바일: 메뉴만 보이고 클릭 시 children 보임, PC: 기존대로 */}
      <aside className='flex w-full max-w-xs justify-center md:block md:w-1/3 md:max-w-sm lg:w-1/4'>
        <div className='block md:hidden'>
          {!showContent ? <ProfileMenu onMenuClick={() => setShowContent(true)} /> : null}
        </div>
        <div className='hidden md:block'>
          <ProfileMenu />
        </div>
      </aside>
      {/* 선택된 메뉴 컨텐츠 */}
      <main className='w-full md:flex-1'>
        {/* 모바일: 메뉴 클릭 전에는 children 숨김, 클릭 후에만 children 보임 */}
        <div className='block flex min-h-[60vh] items-center justify-center md:hidden'>
          {showContent && (
            <ProfileMobileContext.Provider value={{ onCancel: () => setShowContent(false) }}>
              {children}
            </ProfileMobileContext.Provider>
          )}
        </div>
        {/* PC: 항상 children 보임 */}
        <div className='hidden md:block'>{children}</div>
      </main>
    </div>
  );
}
