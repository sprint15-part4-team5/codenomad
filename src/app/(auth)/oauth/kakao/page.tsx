'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import instance from '@/lib/api/axios';
import { useAuthStore } from '@/store/useAuthStore';
import LoadingPage from '@/components/common/LoadingPage';

const KakaoCallbackPage = () => {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);

  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const fetchKakaoToken = async () => {
      const code = new URL(window.location.href).searchParams.get('code');
      if (!code) return;

      try {
        const loginRes = await instance.post('oauth/sign-in/kakao', {
          token: code,
          redirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI,
        });

        const { accessToken, refreshToken, user } = loginRes.data;
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        setUser(user);

        router.push('/home');
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        if (error?.response?.status && [403, 404].includes(error.response.status)) {
          router.replace(`/oauth/kakao/signup?code=${code}`);
        } else {
          alert('카카오 로그인 실패');
        }
      }
    };

    fetchKakaoToken();
  }, [router, setAccessToken, setRefreshToken, setUser]);

  return <LoadingPage message='카카오 로그인 처리 중입니다...' />;
};

export default KakaoCallbackPage;
