'use client';

import { useState, createContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProfileMenu from '@/components/profile/ProfileMenu';

// 모바일 전용 Context: 서브페이지에서 메뉴로 돌아가는 기능 제공
export const ProfileMobileContext = createContext<{ onCancel: () => void } | null>(null);

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // 모바일에서 메뉴/콘텐츠 전환 상태
  const [showContent, setShowContent] = useState(false);

  // 모바일 기준 (화면 사이즈 768px 미만) 여부 체크
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // 모바일에서 URL과 상태 동기화: pathname 변화에 따라 showContent 업데이트
  useEffect(() => {
    if (!isMobile) return;

    // 모바일에서 기본 메뉴 페이지 경로(ex: '/profile')는 showContent false
    // 상세 페이지 경로는 showContent true로 간주 (예: /profile/info, /profile/reservations 등)
    // 필요하면 조건을 프로젝트 라우팅 구조에 맞게 조정하세요
    const mobileMenuPaths = ['/profile', '/profile/']; // 메뉴 페이지 URL, 필요하면 추가

    if (mobileMenuPaths.includes(pathname)) {
      setShowContent(false); // 메뉴 화면
    } else {
      setShowContent(true); // 상세 화면
    }
  }, [pathname, isMobile]);

  // 브라우저 뒤로가기 시 popstate 이벤트로 상태 복구
  useEffect(() => {
    if (!isMobile) return;

    const onPopState = () => {
      // 뒤로가기/앞으로가기로 인해 URL이 바뀔 때 pathname에 따라 상태 변경
      const currentPath = window.location.pathname;
      const mobileMenuPaths = ['/profile', '/profile/'];

      if (mobileMenuPaths.includes(currentPath)) {
        setShowContent(false);
      } else {
        setShowContent(true);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isMobile]);

  // 모바일 메뉴 클릭 시 URL 이동과 상태 전환을 함께 수행하는 함수
  const handleMenuClick = (path: string) => {
    setShowContent(true);
    router.push(path);
  };

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
            <ProfileMobileContext.Provider
              value={{
                onCancel: () => {
                  // 모바일 상세 화면에서 '취소' 혹은 메뉴로 돌아가기 동작

                  // 메뉴 페이지로 URL 이동
                  setShowContent(false);
                  router.push('/profile'); // 모바일 메뉴 페이지 경로로 다시 이동
                },
              }}
            >
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
