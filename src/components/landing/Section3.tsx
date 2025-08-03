import Image from 'next/image';

const Section3 = () => {
  return (
    <section className='bg-main md:px-71px md:pt-96px md:pb-77px lg:px-183px lg:pt-166px lg:pb-153px relative flex h-530 w-full flex-col items-center justify-center px-14 pt-36 pb-86 md:h-1025 lg:h-882'>
      <h2 className='font-hakgyo text-primary-400 lg:min-text-6xl mt-40 mb-44 text-center text-2xl font-bold whitespace-nowrap md:mt-0 md:mb-91 md:text-5xl lg:mb-110'>
        다양한 체험들을 즐겨보세요
      </h2>

      <div className='grid w-full grid-cols-2 gap-x-20 gap-y-16 md:gap-10 lg:flex lg:justify-center lg:gap-x-0 lg:space-x-18 lg:gap-y-0'>
        {[
          { src: '/imgs/landing-dance.png', alt: '체험 썸네일1', label: '다양한 스트릿 댄스' },
          { src: '/imgs/landing-talk.png', alt: '체험 썸네일2', label: '숨겨진 사진 찍기' },
          { src: '/imgs/landing-trip.png', alt: '체험 썸네일3', label: '바닷가에서 인물 살기' },
          {
            src: '/imgs/landing-nomad.png',
            alt: '체험 썸네일4',
            label: '해변가에서 디지털 노마드',
          },
        ].map((item, i) => (
          <div key={i} className='flex flex-col items-center lg:w-[22%]'>
            <div className='shadow-custom-5 aspect-square w-full max-w-194 min-w-162 overflow-hidden rounded-3xl md:max-w-291 lg:max-w-375'>
              <Image
                src={item.src}
                alt={item.alt}
                width={500}
                height={500}
                className='h-full w-full object-cover'
              />
            </div>
            <p className='font-hakgyo text-primary-400 hidden w-[calc(90%-10px)] text-center text-[100%] whitespace-nowrap md:mt-19 md:block lg:mt-29'>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Section3;
