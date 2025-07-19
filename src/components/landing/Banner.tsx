'use client';

import Image from 'next/image';

const Banner = () => {
  return (
    <section className='relative h-181 w-full overflow-hidden rounded-[12px] md:h-375 md:rounded-[24px] lg:h-500'>
      <Image src='/imgs/banner.jpg' alt='메인 배너 이미지' fill className='object-cover' priority />
      <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/30 px-4 text-center whitespace-nowrap text-white'>
        <h1 className='text-18-b md:text-24-b lg:text-32-b mb-4'>함께 배우면 즐거운 스트릿 댄스</h1>
        <p className='text-14-m md:text-18-b lg:text-18-b'>1월의 인기체험 BEST 🔥</p>
      </div>
    </section>
  );
};

export default Banner;
