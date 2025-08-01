'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();
  return (
    <>
      <div className='flex h-screen flex-col items-center justify-center gap-24'>
        <div className='relative size-300'>
          <Image alt='에러 이미지' src={'/icons/404_kkot.svg'} fill />
        </div>
        <h1 className='text-14-b md:text-18-b text-center text-gray-500'>
          앗, 이 페이지는 사라졌거나 존재하지 않아요. <br />
          다른 페이지를 탐험해보세요!
        </h1>
        <button
          className='bg-primary-500 text-14-m h-50 w-250 self-center rounded-2xl text-white md:w-300'
          onClick={() => router.push('/')} // 추후 체험 목록 페이지에 맞춰 변경 예정
        >
          홈으로 돌아가기
        </button>
      </div>
    </>
  );
};

export default Page;
