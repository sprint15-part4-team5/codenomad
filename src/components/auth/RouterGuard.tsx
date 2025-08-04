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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace('/login');
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, router]);

  if (isLoading) return <LoadingPage />;
  return <>{children}</>;
}
