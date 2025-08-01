import Image from 'next/image';
import type { BannerImageInputProps } from './MyExperiences';

const BannerImageInput = ({
  bannerPreview,
  onChange,
  onRemove,
  banner,
  isEdit = false,
}: BannerImageInputProps) => {
  return (
    <div className='mb-30'>
      <div className='text-16-b mb-10'>배너 이미지 등록</div>
      <div className='flex gap-12 md:gap-14'>
        <label
          className={`relative flex size-80 cursor-pointer items-center justify-center rounded-lg border border-gray-100 bg-white md:size-126 lg:size-128 ${bannerPreview ? 'pointer-events-none' : ''}`}
        >
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 md:gap-10'>
            <Image src='/icons/icon_gray_plus.svg' alt='배너 이미지 추가' width={40} height={40} />
            <span className='text-13-m text-gray-600'>{bannerPreview ? '1/1' : '0/1'}</span>
          </div>
          <input
            type='file'
            accept='image/*'
            className='absolute inset-0 cursor-pointer opacity-0'
            onChange={onChange}
            disabled={!!banner}
            required={!isEdit && !bannerPreview} // edit 페이지에서는 기존 이미지가 있으면 required 해제
          />
        </label>
        {bannerPreview && (
          <div className='relative size-80 flex-shrink-0 rounded-lg border border-gray-100 md:size-126 lg:size-128'>
            <Image
              src={bannerPreview}
              alt='배너 이미지 미리보기'
              fill
              className='rounded-lg object-cover'
            />
            <button type='button' className='absolute -top-5 -right-5 z-10' onClick={onRemove}>
              <Image
                src='/icons/icon_white_delete.svg'
                alt='삭제'
                width={20}
                height={20}
                className='size-20 md:size-26'
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerImageInput;
