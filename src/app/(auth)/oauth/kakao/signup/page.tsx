'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import instance from '@/lib/api/axios';
import Input from '@/components/common/Input';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useAuthStore } from '@/store/useAuthStore';

const KakaoSignupPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);

  const setUser = useAuthStore((state) => state.setUser);

  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateNickname = (value: string) => {
    setNicknameError(value.length <= 10 ? '' : '10자 이하로 입력해주세요.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !nickname || nicknameError) return;

    try {
      const res = await instance.post('oauth/sign-up/kakao', {
        token: code,
        nickname,
        redirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI,
      });

      const { accessToken, refreshToken, user } = res.data;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      setUser(user);

      router.push('/home');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const serverMessage = err?.response?.data?.message ?? '회원가입에 실패했습니다.';
      setErrorMessage(serverMessage);
      setIsModalOpen(true);
    }
  };

  return (
    <main className='flex min-h-screen items-start justify-center px-1 pt-60'>
      <ConfirmModal
        isOpen={isModalOpen}
        message={errorMessage}
        onClose={() => setIsModalOpen(false)}
      />
      <form
        onSubmit={handleSubmit}
        className='rounded-16 w-full max-w-376 space-y-24 p-24 md:max-w-640 md:p-32'
      >
        <h2 className='text-20-b text-center'>닉네임 입력</h2>
        <Input
          label='닉네임'
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onBlur={(e) => validateNickname(e.target.value)}
          error={nicknameError}
          placeholder='닉네임을 입력해주세요'
        />
        <button
          type='submit'
          className='text-16-m bg-primary-500 h-48 w-full rounded-[12px] py-3 text-white disabled:bg-gray-300'
          disabled={!nickname || !!nicknameError}
        >
          간편 회원가입
        </button>
      </form>
    </main>
  );
};

export default KakaoSignupPage;
