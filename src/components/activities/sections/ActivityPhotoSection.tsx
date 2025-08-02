import { clsx } from 'clsx';
import type { SubImage } from '../Activities.types';
import SafeImage from '@/components/common/SafeImage';

interface ActivityPhotoSectionProps {
  bannerImages: string;
  subImages: SubImage[];
}

const ActivityPhotoSection = ({ bannerImages, subImages }: ActivityPhotoSectionProps) => {
  const renderImageSection = () => {
    const length = subImages.length;

    if (length === 0) return null;

    if (length === 1) {
      return (
        <figure className='relative h-full w-full overflow-hidden'>
          <SafeImage
            src={subImages[0].imageUrl}
            alt='서브 이미지 1'
            fill
            className='object-cover'
          />
        </figure>
      );
    }

    const gridClass = clsx(
      'grid h-full w-full gap-8 md:gap-12 ',
      length === 2 && 'grid-rows-2',
      length >= 3 && 'grid-cols-2 grid-rows-2',
    );

    return (
      <div className={gridClass}>
        {subImages.map((img, index) => (
          <figure
            key={img.id}
            className={clsx(
              'relative h-full overflow-hidden',
              length === 3 && index === 2 && 'col-span-2',
            )}
          >
            <SafeImage
              src={img.imageUrl}
              alt={`서브 이미지 ${index + 1}`}
              fill
              className='object-cover'
            />
          </figure>
        ))}
      </div>
    );
  };

  return (
    <section className='flex h-245 w-auto items-center justify-center gap-8 overflow-hidden rounded-3xl sm:h-400 md:gap-12 lg:h-600'>
      <figure className='relative h-full w-full overflow-hidden'>
        <SafeImage className='object-cover' src={bannerImages} alt='메인 이미지' fill />
      </figure>
      {renderImageSection()}
    </section>
  );
};

export default ActivityPhotoSection;
