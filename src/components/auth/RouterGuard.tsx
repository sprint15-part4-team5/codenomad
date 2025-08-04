'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import LoadingPage from '../common/LoadingPage';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { isLoggedIn } = useAuthStore();
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // hydration이 끝나기 전에는 아무 것도 하지 않음
    if (!hasHydrated) return;

    if (!isLoggedIn) {
      router.replace('/login');
    } else {
      setIsLoading(false);
    }
  }, [hasHydrated, isLoggedIn, router]);

  if (!hasHydrated || isLoading) {
    return <LoadingPage />; // hydration 중이거나 로그인 체크 중이면 로딩 페이지
  }

  return <>{children}</>;
}
