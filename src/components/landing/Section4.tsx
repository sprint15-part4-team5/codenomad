import ReviewCard from '../activities/ReviewCard';

const LANDING_REVIEWS = [
  {
    nickname: '김서퍼',
    rating: 5,
    content:
      '저는 서핑이 처음이라 긴장했지만 정말 재미있는 시간을 보냈습니다. 강사님이 친절하고 자세히 설명해 주셔서 금방 배울 수 있었고, 시원한 파도 위에서의 경험 덕분에 서핑이라는 새로운 취미를 갖게 되었습니다. 꼭 다시 하고 싶은 체험이에요!',
    createdAt: '2025-08-01',
  },
  {
    nickname: '박등산',
    rating: 5,
    content:
      '이번 산악 트레킹 체험은 제게 기대 이상의 즐거움을 주었습니다. 가이드 분이 전문적이고 친절하게 안내해 주셔서 안전하게 산을 오를 수 있었고, 아름다운 풍경과 맑은 공기를 통해 자연을 제대로 느낄 수 있었습니다. 적극 추천합니다!',
    createdAt: '2025-07-30',
  },
  {
    nickname: '이요리',
    rating: 5,
    content:
      '요리를 좋아하는 저에게 이 쿠킹 클래스는 정말 완벽한 경험이었습니다. 전문 셰프님이 직접 가르쳐주셔서 이해하기 쉬웠고, 요리 초보자부터 숙련자까지 누구나 만족할 수 있는 구성으로 알차게 진행되었습니다. 이번 체험을 통해 요리에 대한 열정이 더 커졌어요!',
    createdAt: '2025-07-29',
  },
  {
    nickname: '최사진',
    rating: 5,
    content:
      '평소 사진 찍는 걸 좋아하지만 전문적인 지식은 부족했는데, 이번 사진 워크숍 체험 덕분에 정말 많은 것을 배웠습니다. 전문 사진작가님이 직접 친절하게 설명해 주셔서 쉽게 이해할 수 있었고, 사진 찍기에 대한 자신감과 흥미가 더욱 생겼어요. 꼭 추천드려요!',
    createdAt: '2025-07-28',
  },
];

const Section4 = () => {
  return (
    <section className='bg-primary-400 flex h-full w-full flex-col items-center justify-start gap-32 p-20 md:gap-64 lg:h-814'>
      <h2 className='font-hakgyo text-primary-100 text-2xl font-semibold tracking-[-0.1rem] md:text-5xl lg:text-[4rem]'>
        다양한 체험들을 즐겨보세요
      </h2>
      <div className='flex w-full flex-col gap-16 md:grid md:grid-cols-2 md:grid-rows-2 md:gap-16 lg:flex lg:flex-row lg:gap-32'>
        {LANDING_REVIEWS.map((review, index) => (
          <ReviewCard
            key={index}
            nickname={review.nickname}
            rating={review.rating}
            content={review.content}
            createdAt={review.createdAt}
            className='w-full lg:h-381'
          />
        ))}
      </div>
    </section>
  );
};

export default Section4;
