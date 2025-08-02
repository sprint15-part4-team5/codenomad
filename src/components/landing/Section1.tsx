'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Section1 = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/home');
  };

  return (
    <div className='bg-primary-100 p10 flex w-full justify-center p-20 sm:p-50 lg:p-100'>
      <section className='relative mx-auto h-320 w-full max-w-[1448px] overflow-hidden rounded-3xl sm:h-420 lg:h-520'>
        {/* 배경 이미지 */}
        <Image
          src='/imgs/banner.jpg'
          alt='메인 배너 이미지'
          fill
          sizes='(max-width: 768px) 100vw, 50vw'
          className='object-cover'
          priority
        />

        {/* 배경 위 콘텐츠 */}
        <div className='absolute inset-0 flex flex-col items-center justify-end gap-10 px-14 pb-10 text-center backdrop-blur-sm sm:gap-20 sm:pb-20 lg:gap-24'>
          {/* 로고 이미지 */}
          <Image
            src='/icons/wazylogowhite.svg'
            alt='wazy logo white'
            width={0}
            height={0}
            sizes='100vw'
            className='h-100 w-auto sm:h-173 lg:h-212'
          />

          {/* 소개 문구 */}
          <p className='text-16-m sm:text-24-m text-white'>
            체험을 등록하고 <br className='sm:hidden' />
            즐길 수 있는 가장 쉬운 방법
          </p>

          {/* 입장하기 버튼 */}
          <button
            onClick={handleClick}
            className='text-14-m hover w-190 rounded-2xl border border-white px-24 py-10 text-white sm:px-32 sm:py-12'
          >
            입장하기
          </button>

          {/* 꽃 라인 */}
          <div className='mt-18 flex w-full items-center justify-center gap-12 px-4'>
            <div className='h-2 w-full bg-white' />
            <Image
              src='/icons/flower.svg'
              alt='꽃 아이콘'
              width={20}
              height={20}
              className='h-20 w-20'
            />
            <div className='h-2 w-full bg-white' />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Section1;
