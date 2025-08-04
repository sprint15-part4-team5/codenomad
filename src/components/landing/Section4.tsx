import ReviewCard from '../activities/ReviewCard';

const LANDING_REVIEWS = [
  {
    nickname: '김서퍼',
    rating: 5,
    content:
      '서핑이 처음이라 긴장했지만, 친절한 강사님 덕분에 금방 배울 수 있었어요. 시원한 파도 위에서 새로운 취미를 찾았습니다. 꼭 다시 하고 싶은 체험이에요!',
    createdAt: '2025-08-01',
  },
  {
    nickname: '박등산',
    rating: 5,
    content:
      '산악 트레킹이 기대 이상으로 즐거웠어요. 전문 가이드와 함께 아름다운 풍경을 만끽하며 안전하게 다녀왔습니다. 적극 추천합니다!',
    createdAt: '2025-07-02',
  },
  {
    nickname: '이요리',
    rating: 5,
    content:
      '쿠킹 클래스가 정말 완벽했어요. 셰프님의 친절한 설명 덕분에 초보자도 쉽게 배울 수 있었고, 요리에 대한 열정이 더 커졌습니다.',
    createdAt: '2025-11-09',
  },
  {
    nickname: '최사진',
    rating: 5,
    content:
      '사진 워크숍에서 많은 걸 배웠어요. 작가님의 친절한 설명으로 사진 찍기가 더 재미있어졌고, 자신감도 생겼습니다. 추천드려요!',
    createdAt: '2025-07-08',
  },
];

const Section4 = () => {
  return (
    <section className='bg-primary-400 flex h-full w-full flex-col items-center justify-around gap-32 px-48 py-20 md:gap-32 md:px-75 lg:h-814 lg:px-100 lg:py-90'>
      <h2 className='font-hakgyo text-primary-100 text-center text-2xl font-semibold tracking-[-0.1rem] whitespace-nowrap md:text-5xl lg:text-[4rem]'>
        생생한 후기를 보고 <br />
        나만의 순간을 만들어보세요
      </h2>
      <div className='flex w-full flex-col gap-16 md:grid md:grid-cols-2 md:grid-rows-2 md:gap-16 lg:flex lg:flex-row lg:justify-around lg:gap-8'>
        {LANDING_REVIEWS.map((review, index) => (
          <ReviewCard
            key={index}
            nickname={review.nickname}
            rating={review.rating}
            content={review.content}
            createdAt={review.createdAt}
            className='min-h-187 w-auto lg:min-h-300 lg:w-350 lg:p-10'
            disableExpand={true}
          />
        ))}
      </div>
    </section>
  );
};

export default Section4;
