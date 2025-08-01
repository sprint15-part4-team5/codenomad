'use client';

import Image from 'next/image';

const Footer = () => {
  return (
    <footer className='h-116 w-full border-t border-b border-gray-200 bg-white md:h-140'>
      <div className='text-13-m mx-auto flex h-full max-w-screen-xl items-center justify-between px-6 text-gray-500'>
        {/* 왼쪽: 저작권 */}
        <div>©team CodeNomad </div>

        {/* 오른쪽: 소셜 아이콘 */}
        <div className='flex items-center gap-3'>
          <a
            href='https://github.com/sprint15-part4-team5/codenomad'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:underline'
          >
            <Image src='/icons/icon_github.png' alt='GitHub 마크 로고' width={32} height={32} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
