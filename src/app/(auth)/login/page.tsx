'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Input from '@/components/common/Input';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useRouter } from 'next/navigation';
import { loginApi } from '@/lib/api/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  // 유효성 검사 함수
  const validateEmail = (value: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailError(isValid ? '' : '이메일 형식으로 작성해 주세요.');
  };

  const validatePassword = (value: string) => {
    setPasswordError(value.length >= 8 ? '' : '8자 이상 작성해 주세요.');
  };

  // 폼 유효성 상태
  const isFormValid = email && password && !emailError && !passwordError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      const res = await loginApi({ email, password });
      const { user, accessToken, refreshToken } = res;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('user-update'));

      // 성공 시 이동, 에러 시 모달
      router.push('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = (error.response?.data as { message?: string })?.message;
        const fallback = '로그인에 실패했습니다.';
        setErrorMessage(serverMessage ?? fallback);
      } else {
        setErrorMessage('알 수 없는 오류가 발생했습니다.');
      }

      setIsModalOpen(true); // 모달 오픈
    }
  };

  return (
    <main className='min-h-screen flex justify-center px-1 pt-60 lg:pt-100'>
      <ConfirmModal
        isOpen={isModalOpen}
        message={errorMessage}
        onClose={() => setIsModalOpen(false)}
      />

      <form
        onSubmit={handleSubmit}
        className='w-full max-w-376 md:max-w-640 flex flex-col space-y-24 p-24 md:p-32 bg-white rounded-16'
      >
        {/* 로고 */}
        <div>
          <Link href='/'>
            <img
              src='/icons/logoHorizon.svg'
              alt='GlobalNomad Logo'
              className='mx-auto mb-32 w-144 md:w-255'
            />
          </Link>
        </div>

        {/* 이메일 입력 */}
        <Input
          label='이메일'
          type='email'
          placeholder='이메일을 입력해 주세요'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={(e) => validateEmail(e.target.value)}
          error={emailError}
          autoComplete='email'
        />

        {/* 비밀번호 입력 */}
        <Input
          label='비밀번호'
          type='password'
          placeholder='비밀번호를 입력해 주세요'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={(e) => validatePassword(e.target.value)}
          error={passwordError}
          autoComplete='current-password'
        />

        {/* 로그인 버튼 */}
        <button
          className='w-full h-48 rounded-[16px] text-white text-16-m bg-primary-500 disabled:bg-gray-300 cursor-pointer'
          disabled={!isFormValid}
          type='submit'
        >
          로그인하기
        </button>

        {/* or */}
        <div className='flex items-center justify-center w-full'>
          <hr className='flex-grow border-t border-gray-300' />
          <span className='px-16 text-16-m text-gray-500 whitespace-nowrap'>or</span>
          <hr className='flex-grow border-t border-gray-300' />
        </div>

        {/* 카카오 로그인 */}
        <button className='w-full h-48 border border-gray-300 rounded-[16px] flex justify-center items-center text-gray-600 text-16-m cursor-pointer hover:bg-gray-100 transition-colors duration-200'>
          <img src='/icons/icon_kakao.svg' alt='kakaoicon' className='w-20 h-20 mr-8' />
          카카오 로그인
        </button>

        {/* 회원가입 링크 */}
        <p className='text-center text-13-m text-gray-600'>
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
