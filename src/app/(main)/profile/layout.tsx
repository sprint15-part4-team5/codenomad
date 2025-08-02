'use client';

import { useState, createContext, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProfileMenu from '@/components/profile/ProfileMenu';

// 모바일 메뉴 경로 중앙 관리
type ProfilePath = '/profile' | '/profile/';
const MOBILE_MENU_PATHS = ['/profile', '/profile/'] as const;
const BASE_PROFILE_PATH = '/profile';

// 모바일 전용 Context: 서브페이지에서 메뉴로 돌아가는 기능 제공
export const ProfileMobileContext = createContext<{ onCancel: () => void } | null>(null);

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showContent, setShowContent] = useState(false);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // 경로에 따른 화면 상태 결정 로직을 함수로 분리
  const isMenuPath = useCallback((path: string): boolean => {
    const isValidPath = (p: string): p is ProfilePath => {
      return MOBILE_MENU_PATHS.includes(p as ProfilePath);
    };

    return isValidPath(path);
  }, []);

  // 화면 상태 업데이트 로직을 함수로 분리
  const updateContentVisibility = useCallback(
    (path: string) => {
      setShowContent(!isMenuPath(path));
    },
    [isMenuPath],
  );

  // pathname 변화에 따른 상태 업데이트
  useEffect(() => {
    if (!isMobile) return;
    updateContentVisibility(pathname);
  }, [pathname, isMobile, updateContentVisibility]);

  // popstate 이벤트 핸들러
  useEffect(() => {
    if (!isMobile) return;

    const onPopState = () => {
      updateContentVisibility(window.location.pathname);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isMobile, updateContentVisibility]);

  // 모바일 메뉴 클릭 핸들러
  const handleMenuClick = (path: string) => {
    setShowContent(true);
    router.push(path);
  };

  // 모바일 취소 핸들러
  const handleCancel = useCallback(() => {
    setShowContent(false);
    router.push(BASE_PROFILE_PATH);
  }, [router]);

  return (
    <div className='mx-auto flex min-h-screen max-w-375 flex-col items-center gap-8 bg-white px-4 py-10 md:max-w-744 md:flex-row md:items-start md:justify-center md:gap-12 md:px-8 lg:max-w-7xl lg:px-16'>
      {/* 사이드바 영역: 프로필 메뉴 */}
      <aside className='sticky top-10 flex w-full max-w-xs justify-center md:block md:w-1/3 md:max-w-sm lg:w-1/4'>
        {/* 모바일 화면 (md 미만) */}
        <div className='block md:hidden'>
          {!showContent ? <ProfileMenu onMenuClick={handleMenuClick} /> : null}
        </div>

        {/* 데스크톱/태블릿 (md 이상) */}
        <div className='hidden md:block'>
          <div className='ml-40 lg:ml-100'>
            {/* 데스크톱/태블릿은 메뉴 클릭 시 화면 전환이 URL 이동으로 처리가 기본이므로 onMenuClick 없음 */}
            <ProfileMenu />
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className='w-full md:flex-1'>
        {/* 모바일: showContent true일 때만 렌더링, Context 통해 onCancel 함수 전달 */}
        <div className='block flex min-h-[60vh] items-center justify-center md:hidden'>
          {showContent && (
            <ProfileMobileContext.Provider value={{ onCancel: handleCancel }}>
              {children}
            </ProfileMobileContext.Provider>
          )}
        </div>

        {/* 데스크톱/태블릿: 항상 children 렌더링 */}
        <div className='hidden md:block'>{children}</div>
      </main>
    </div>
  );
}
