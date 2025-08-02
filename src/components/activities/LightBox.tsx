'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import clsx from 'clsx';

interface LightboxProps {
  images: { src: string; alt: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const Lightbox = ({ images, currentIndex, isOpen, onClose }: LightboxProps) => {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    if (isOpen) {
      setIndex(currentIndex);
    }
  }, [isOpen, currentIndex]);

  useEffect(() => {
    const lockScroll = () => {
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overscrollBehavior = 'none';
    };

    const unlockScroll = () => {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    };

    if (isOpen) {
      lockScroll();
      window.addEventListener('resize', lockScroll);
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll();
      window.removeEventListener('resize', lockScroll);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-8 bg-black/90'
      onClick={onClose}
    >
      {/* 닫기 버튼 */}
      <div className='mr-10 w-fit self-end p-4'>
        <button className='text-2xl text-white md:text-3xl' onClick={onClose}>
          ✕
        </button>
      </div>

      {/* 이미지 + 버튼 (가로 중앙 정렬) */}
      <div className='relative w-fit' onClick={(e) => e.stopPropagation()}>
        <div className='relative h-auto w-300 md:size-500 lg:w-700'>
          <Image
            src={images[index].src}
            alt={images[index].alt}
            fill
            className='object-contain'
            priority
          />

          {/* ← 버튼 */}
          <button
            className='border-primary-500 absolute top-1/2 left-2 size-40 -translate-y-1/2 rounded-2xl border-2 bg-white/80 md:left-4 md:size-50'
            onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)}
          >
            <Image src={'/icons/icon_chevron_left.svg'} alt={'왼쪽 화살표'} fill />
          </button>

          {/* → 버튼 */}
          <button
            className='border-primary-500 absolute top-1/2 right-2 size-40 -translate-y-1/2 rounded-2xl border-2 bg-white/80 md:right-4 md:size-50'
            onClick={() => setIndex((prev) => (prev + 1) % images.length)}
          >
            <Image src={'/icons/icon_chevron_right.svg'} alt={'오른쪽 화살표'} fill />
          </button>
        </div>
      </div>

      {/* 인덱스 */}
      <div className='mt-8 text-center text-sm text-white'>
        {index + 1} / {images.length}
      </div>

      {/* 썸네일 */}
      <div className='mt-8 flex w-full justify-center gap-4 overflow-x-auto px-4'>
        {images.map((img, i) => (
          <div
            key={i}
            className={clsx(
              'relative h-20 w-28 cursor-pointer overflow-hidden rounded-md border-2 md:h-28 md:w-44',
              i === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100',
            )}
            onClick={() => setIndex(i)}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className='object-cover'
              loading={i === index ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
};

export default Lightbox;
