'use client';

import Image from 'next/image';
import SearchBar from './SearchBar';

const Banner = () => {
  return (
    <section className='relative h-320 w-full overflow-hidden rounded-[0.75rem] sm:h-420 sm:rounded-[1.5rem] lg:h-520'>
      <Image
        src='/imgs/banner.jpg'
        alt='메인 배너 이미지'
        fill
        sizes='(max-width: 768) 100vw, 50vw'
        className='object-cover'
        priority
      />
      <div className='absolute inset-0 flex flex-col items-center justify-end px-14 backdrop-blur-sm'>
        <Image
          src='/icons/wazylogowhite.svg'
          alt='wazy logo white'
          width={0}
          height={0}
          sizes='100vw'
          className='h-124 w-auto sm:h-173 lg:h-212'
        />
        <SearchBar />
      </div>
    </section>
  );
};

export default Banner;
