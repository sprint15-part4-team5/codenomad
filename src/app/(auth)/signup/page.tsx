'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/auth/Input';
import ConfirmModal from '@/components/common/ConfirmModal';
import { signupSchema, SignupFormValues } from '@/lib/schema/authSchema';
import { signupApi } from '@/lib/api/auth';
import { redirectToKakaoOAuth } from '@/lib/utils/kakao';
import axios from 'axios';

const SignupPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signupApi({
        email: data.email,
        password: data.password,
        nickname: data.nickname,
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = (error.response?.data as { message?: string })?.message;
        const fallback = '회원가입에 실패했습니다.';
        setErrorMessage(serverMessage ?? fallback);
      } else {
        setErrorMessage('알 수 없는 오류가 발생했습니다.');
      }
      setIsModalOpen(true);
    }
  };

  return (
    <main className='flex min-h-screen justify-center px-1 pt-60 lg:pt-100'>
      {/* 가입 완료 모달 */}
      <ConfirmModal
        isOpen={isSuccessModalOpen}
        message='가입이 완료되었습니다.'
        onClose={() => {
          setIsSuccessModalOpen(false);
          router.push('/login');
        }}
      />
      {/* 중복 이메일 모달 */}
      <ConfirmModal
        isOpen={isModalOpen}
        message={errorMessage}
        onClose={() => setIsModalOpen(false)}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='rounded-16 w-full max-w-376 space-y-24 bg-white p-24 md:max-w-640 md:p-32'
      >
        {/* 로고 */}
        <div>
          <Link href='/home'>
            <Image
              src='/icons/wazylogoHorizon.svg'
              alt='Wazy Logo'
              width={120}
              height={120}
              priority
              className='mx-auto mb-32 md:w-255'
            />
          </Link>
        </div>

        <Input
          label='이메일'
          placeholder='이메일을 입력해 주세요'
          type='email'
          autoComplete='email'
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label='닉네임'
          placeholder='닉네임을 입력해 주세요'
          autoComplete='username'
          {...register('nickname')}
          error={errors.nickname?.message}
        />

        <Input
          label='비밀번호'
          placeholder='8자 이상 입력해 주세요'
          type='password'
          autoComplete='new-password'
          {...register('password')}
          error={errors.password?.message}
        />

        <Input
          label='비밀번호 확인'
          placeholder='비밀번호를 한번 더 입력해 주세요'
          type='password'
          autoComplete='new-password'
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <button
          type='submit'
          disabled={!isValid}
          className='text-16-m bg-primary-500 hover:shadow-brand-blue/60 h-48 w-full cursor-pointer rounded-[12px] py-3 text-white transition-all duration-200 hover:shadow-md disabled:bg-gray-300'
        >
          회원가입 하기
        </button>

        {/* SNS 구분선 */}
        <div className='flex w-full items-center justify-center'>
          <hr className='flex-grow border-t border-gray-300' />
          <span className='text-16-m px-16 whitespace-nowrap text-gray-500'>
            sns 계정으로 회원가입하기
          </span>
          <hr className='flex-grow border-t border-gray-300' />
        </div>

        {/* 카카오 회원가입 */}
        <button
          onClick={redirectToKakaoOAuth}
          className='text-16-m flex w-full cursor-pointer items-center justify-center rounded-[12px] border border-gray-300 py-12 text-gray-600 transition-colors duration-200 hover:bg-[#FEE500]'
        >
          <Image
            src='/icons/icon_kakao.svg'
            alt='kakaoicon'
            width={20}
            height={20}
            className='mr-8 text-gray-600'
          />
          카카오 회원가입
        </button>

        {/* 로그인 링크 */}
        <p className='text-13-m text-center text-gray-600'>
          회원이신가요?{' '}
          <Link href='/login' className='text-13-b text-gray-600 underline'>
            로그인하기
          </Link>
        </p>
      </form>
    </main>
  );
};

export default SignupPage;
