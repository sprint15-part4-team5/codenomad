import Image from 'next/image';
import type { IntroImagesInputProps } from './MyExperiences';

const IntroImagesInput = ({ introPreviews = [], onChange, onRemove }: IntroImagesInputProps) => {
  return (
    <div className='mb-24'>
      <div className='text-16-b mb-10'>소개 이미지 등록</div>
      <div className='flex gap-12 overflow-x-auto px-1 py-6 md:gap-14'>
        {/* 업로드 버튼(항상 왼쪽, 4개가 되어도 비활성화만) */}
        <label
          className={`relative flex size-80 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-100 bg-white md:size-126 lg:size-128 ${introPreviews.length >= 4 ? 'pointer-events-none' : ''}`}
        >
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 md:gap-10'>
            <Image src='/icons/icon_gray_plus.svg' alt='소개 이미지 추가' width={40} height={40} />
            <span className='text-13-m text-gray-600'>{introPreviews.length}/4</span>
          </div>
          <input
            type='file'
            accept='image/*'
            multiple
            className='absolute inset-0 cursor-pointer opacity-0'
            onChange={onChange}
            disabled={introPreviews.length >= 4}
          />
        </label>
        {/* 등록된 이미지들 오른쪽에 나열 */}
        {introPreviews.map((src, idx) => (
          <div
            key={idx}
            className='relative size-80 flex-shrink-0 rounded-lg border border-gray-100 md:size-126 lg:size-128'
          >
            <Image
              src={src}
              alt={`소개 이미지 ${idx + 1}`}
              fill
              className='rounded-lg object-cover'
            />
            <button
              type='button'
              className='absolute -top-5 -right-5 z-10'
              onClick={() => onRemove(idx)}
            >
              <Image
                src='/icons/icon_white_delete.svg'
                alt='삭제'
                width={20}
                height={20}
                className='size-20 md:size-26'
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntroImagesInput;
