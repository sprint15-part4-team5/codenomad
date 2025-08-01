'use client';

import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Input from '@/components/auth/Input';
import ConfirmModal from '@/components/common/ConfirmModal';
import { loginApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { redirectToKakaoOAuth } from '@/lib/utils/kakao';
import { loginSchema, type LoginFormValues } from '@/lib/schema/authSchema';

const LoginPage = () => {
  const router = useRouter();
  const { setAccessToken, setRefreshToken, setUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await loginApi(data);
      const { user, accessToken, refreshToken } = res;

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser(user);

      router.push('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = (error.response?.data as { message?: string })?.message;
        setErrorMessage(serverMessage ?? '로그인에 실패했습니다.');
      } else {
        setErrorMessage('알 수 없는 오류가 발생했습니다.');
      }

      setIsModalOpen(true);
    }
  };

  const handleKakaoLogin = () => {
    redirectToKakaoOAuth();
  };

  return (
    <main className='flex min-h-screen justify-center px-1 pt-60 lg:pt-100'>
      <ConfirmModal
        isOpen={isModalOpen}
        message={errorMessage}
        onClose={() => setIsModalOpen(false)}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='rounded-16 flex w-full max-w-376 flex-col space-y-24 bg-white p-24 md:max-w-640 md:p-32'
      >
        {/* 로고 */}
        <div>
          <Link href='/'>
            <img
              src='/icons/wazylogoHorizon.svg'
              alt='Logo'
              className='mx-auto mb-32 w-144 md:w-255'
            />
          </Link>
        </div>

        {/* 이메일 */}
        <Input
          label='이메일'
          type='email'
          placeholder='이메일을 입력해 주세요'
          {...register('email')}
          error={errors.email?.message}
          autoComplete='email'
        />

        {/* 비밀번호 */}
        <Input
          label='비밀번호'
          type='password'
          placeholder='비밀번호를 입력해 주세요'
          {...register('password')}
          error={errors.password?.message}
          autoComplete='current-password'
        />

        {/* 로그인 버튼 */}
        <button
          className='text-16-m bg-primary-500 h-48 w-full cursor-pointer rounded-[16px] text-white disabled:bg-gray-300'
          disabled={!isValid}
          type='submit'
        >
          로그인하기
        </button>

        {/* or 구분선 */}
        <div className='flex w-full items-center justify-center'>
          <hr className='flex-grow border-t border-gray-300' />
          <span className='text-16-m px-16 whitespace-nowrap text-gray-500'>or</span>
          <hr className='flex-grow border-t border-gray-300' />
        </div>

        {/* 카카오 로그인 */}
        <button
          onClick={handleKakaoLogin}
          type='button'
          className='text-16-m flex h-48 w-full cursor-pointer items-center justify-center rounded-[16px] border border-gray-300 text-gray-600 transition-colors duration-200 hover:bg-[#FEE500]'
        >
          <Image
            src='/icons/icon_kakao.svg'
            alt='kakaoicon'
            width={20}
            height={20}
            className='mr-8'
          />
          카카오 로그인
        </button>

        {/* 회원가입 링크 */}
        <p className='text-13-m text-center text-gray-600'>
          회원이 아니신가요?{' '}
          <Link href='/signup' className='text-13-b text-gray-600 underline'>
            회원가입하기
          </Link>
        </p>
      </form>
    </main>
  );
};

export default LoginPage;
