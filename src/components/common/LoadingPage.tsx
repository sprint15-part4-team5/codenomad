'use client';

import Image from 'next/image';

interface LoadingPageProps {
  message?: string;
}

const LoadingPage = ({ message = '페이지를 불러오는 중입니다...' }: LoadingPageProps) => {
  return (
    <main className='flex min-h-screen w-full flex-col items-center justify-start bg-white px-4 pt-[25vh]'>
      <Image
        src='/icons/kkotLoding.gif'
        alt='로딩 중 빙빙돌아가는 꽃'
        width={120}
        height={120}
        className='mb-6 h-120 w-120 object-contain sm:h-255 sm:w-255'
      />
      <h2 className='text-18-b mb-2 text-gray-800'>{message}</h2>
      <p className='text-14-m text-gray-500'>잠시만 기다려주세요 😊</p>
    </main>
  );
};

export default LoadingPage;
