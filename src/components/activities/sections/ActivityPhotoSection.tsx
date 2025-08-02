'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import SafeImage from '@/components/common/SafeImage';
import Lightbox from '@/components/activities/LightBox';
import type { SubImage } from '../Activities.types';

interface ActivityPhotoSectionProps {
  bannerImages: string;
  subImages: SubImage[];
}

const ActivityPhotoSection = ({ bannerImages, subImages }: ActivityPhotoSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allImages = [
    { src: bannerImages, alt: '메인 이미지' },
    ...subImages.map((img, i) => ({
      src: img.imageUrl,
      alt: `서브 이미지 ${i + 1}`,
    })),
  ];

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const renderSubImages = () => {
    const length = subImages.length;
    if (length === 0) return null;

    if (length === 1) {
      return (
        <figure className='relative h-full w-full cursor-pointer overflow-hidden'>
          <SafeImage
            src={subImages[0].imageUrl}
            alt='서브 이미지 1'
            fill
            className='object-cover'
            onClickImage={() => openLightbox(1)}
          />
        </figure>
      );
    }

    const gridClass = clsx(
      'grid h-full w-full gap-8 md:gap-12',
      length === 2 && 'grid-rows-2',
      length >= 3 && 'grid-cols-2 grid-rows-2',
    );

    return (
      <div className={gridClass}>
        {subImages.map((img, i) => (
          <figure
            key={img.id}
            className={clsx(
              'relative h-full cursor-pointer overflow-hidden',
              length === 3 && i === 2 && 'col-span-2',
            )}
          >
            <SafeImage
              src={img.imageUrl}
              alt={`서브 이미지 ${i + 1}`}
              fill
              className='object-cover'
              onClickImage={() => openLightbox(i + 1)} // 메인: 0, 서브: +1
            />
          </figure>
        ))}
      </div>
    );
  };

  return (
    <>
      <section className='flex h-245 w-auto items-center justify-center gap-8 overflow-hidden rounded-3xl sm:h-400 md:gap-12 lg:h-600'>
        <figure className='relative h-full w-full cursor-pointer overflow-hidden'>
          <SafeImage
            src={bannerImages}
            alt='메인 이미지'
            fill
            className='object-cover'
            onClickImage={() => openLightbox(0)}
          />
        </figure>
        {renderSubImages()}
      </section>

      <Lightbox
        images={allImages}
        currentIndex={selectedIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default ActivityPhotoSection;
