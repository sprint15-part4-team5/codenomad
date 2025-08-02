import Image from 'next/image';

const Section2 = () => {
  return (
    <div className='bg-primary-400 flex w-full flex-col px-14 py-26 md:px-67 md:py-48 lg:flex-row lg:gap-50 lg:px-205'>
      <div className='flex flex-col items-start'>
        <div className='relative h-136 w-full md:h-218'>
          <Image
            src='/imgs/section2-text.svg'
            fill
            alt='enjoy your life'
            className='object-contain object-left'
          />
        </div>
        <p className='text-13-m lg:text-16-body-m my-15 px-14 font-light text-white md:w-1/2 lg:w-full'>
          쉽게 즐기는 체험 예약 플랫폼 누구나 간편하게 체험을 등록하고,원하는 체험을 빠르게 예약할
          수 있어요. 가장 쉬운 방법으로 특별한 경험을 만들고 공유해보세요!
        </p>
      </div>
      <div className='flex gap-7 lg:gap-35'>
        <div className='relative h-213 w-170 md:h-375 md:w-294 lg:h-576 lg:w-422'>
          <Image src='/imgs/section2-image1.svg' fill alt='소개 이미지1' />
        </div>
        <div className='relative h-213 w-170 md:h-375 md:w-294 lg:h-576 lg:w-422'>
          <Image src='/imgs/section2-image2.svg' fill alt='소개 이미지2' />
        </div>
      </div>
    </div>
  );
};

export default Section2;
