import Image from 'next/image';

const Section2 = () => {
  return (
    <div className='bg-primary-400 w-full'>
      <div className='flex flex-col items-center justify-center p-21 lg:flex-row lg:gap-15 lg:px-100 lg:py-90'>
        <div className='flex w-full flex-col items-start'>
          <div className='relative h-136 w-full md:h-218'>
            <Image
              src='/imgs/section2-text.svg'
              fill
              alt='enjoy your life'
              className='object-contain object-left'
            />
          </div>
          <p className='text-13-m lg:text-16-body-m my-15 w-full font-light text-white'>
            쉽게 즐기는 체험 예약 플랫폼 누구나 간편하게 체험을 등록하고,
            <br />
            원하는 체험을 빠르게 예약할 수 있어요. 가장 쉬운 방법으로 특별한 경험을 만들고
            공유해보세요!
          </p>
        </div>
        <div className='flex w-full gap-17'>
          <div className='relative h-213 w-full md:h-355 md:w-1/2'>
            <Image
              src='/imgs/section2-image1.svg'
              fill
              alt='소개 이미지1'
              className='rounded-3xl object-cover'
            />
          </div>
          <div className='relative h-213 w-full md:h-355 md:w-1/2'>
            <Image
              src='/imgs/section2-image2.svg'
              fill
              alt='소개 이미지2'
              className='rounded-3xl object-cover'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section2;
