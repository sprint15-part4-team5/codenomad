import Image from 'next/image';

const Section3 = () => {
  // 공통 클래스명들
  const containerClass = 'flex flex-col items-center';
  const imageWrapperClass =
    'shadow-custom-5 flex w-full max-w-162 md:max-w-296 lg:max-w-375 aspect-square items-center justify-center overflow-hidden rounded-3xl';
  const imageClass = 'w-full h-full object-cover';
  const textClass =
    'font-hakgyo text-2xl text-primary-400 hidden text-center font-regular md:mt-12 lg:mt-29 md:block whitespace-nowrap';

  return (
    <section className='bg-main relative flex h-530 w-full flex-col items-center justify-center px-17 md:h-1025 md:px-53 lg:h-882 lg:px-183'>
      <h2 className='font-hakgyo text-primary-400 mb-44 text-center text-2xl leading-tight font-bold whitespace-nowrap md:text-5xl lg:text-6xl'>
        다양한 체험들을 즐겨보세요
      </h2>
      <div className='grid w-full max-w-full grid-cols-2 grid-rows-2 gap-x-20 gap-y-16 md:gap-x-30 md:gap-y-36 lg:flex lg:gap-x-18 lg:gap-y-0'>
        {/* 다양한 스트릿 댄스 */}
        <div className={containerClass}>
          <div className={imageWrapperClass}>
            <Image
              src='/imgs/landing-dance.png'
              alt='체험 썸네일1'
              width={375}
              height={375}
              className={imageClass}
            />
          </div>
          <p className={textClass}>다양한 스트릿 댄스</p>
        </div>

        {/* 숨겨진 사진 찍기 */}
        <div className={containerClass}>
          <div className={imageWrapperClass}>
            <Image
              src='/imgs/landing-talk.png'
              alt='체험 썸네일2'
              width={375}
              height={375}
              className={imageClass}
            />
          </div>
          <p className={textClass}>숨겨진 사진 찍기</p>
        </div>

        {/* 바닷가에서 인물 살기 */}
        <div className={containerClass}>
          <div className={imageWrapperClass}>
            <Image
              src='/imgs/landing-trip.png'
              alt='체험 썸네일3'
              width={375}
              height={375}
              className={`${imageClass.replace('object-cover', 'object-contain')}`}
            />
          </div>
          <p className={textClass}>바닷가에서 인물 살기</p>
        </div>

        {/* 해변가에서 디지털 노마드 */}
        <div className={containerClass}>
          <div className={imageWrapperClass}>
            <Image
              src='/imgs/landing-nomad.png'
              alt='체험 썸네일4'
              width={375}
              height={375}
              className={`${imageClass.replace('object-cover', 'object-contain')}`}
            />
          </div>
          <p className={textClass}>해변가에서 디지털 노마드</p>
        </div>
      </div>
    </section>
  );
};

export default Section3;
