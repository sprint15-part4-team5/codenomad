// app/activities/[id]/page.tsx
import PhotoSection from '@/components/activities/PhotoSection';
import ReviewCard from '@/components/activities/ReviewCard';
import DropdownMenu from '@/components/activities/ActivitesDropdown';
import ReservationContent from '@/components/activities/ReservationFlow/ReservationContent';
import MapView from '@/components/activities/MapView';
import Image from 'next/image';

const mock = {
  id: 7,
  userId: 21,
  title: '함께 배우면 즐거운 스트릿댄스',
  description:
    '안녕하세요! 저희 스트릿 댄스 체험을 소개합니다. 저희는 신나고 재미있는 스트릿 댄스 스타일을 가르칩니다. 크럼프는 세계적으로 인기 있는 댄스 스타일로, 어디서든 춤출 수 있습니다. 저희 체험에서는 새로운 스타일을 접할 수 있고, 즐거운 시간을 보낼 수 있습니다. 저희는 초보자부터 전문가까지 어떤 수준의 춤추는 사람도 가르칠 수 있도록 준비해놓았습니다. 저희와 함께 즐길 수 있는 시간을 기대해주세요! 각종 음악에 적합한 스타일로, 저희는 크럼프 외에도 전통적인 스트릿 댄스 스타일과 최신 스트릿 댄스 스타일까지 가르칠 수 있습니다. 저희 체험에서는 전문가가 직접 강사로 참여하기 때문에, 저희가 제공하는 코스는 어떤 수준의 춤추는 사람도 쉽게 이해할 수 있도록 준비해놓았습니다. 저희 체험을 참가하게 된다면, 즐거운 시간 뿐만 아니라 새로운 스타일을 접할 수 있을 것입니다.',
  category: '투어',
  price: 10000,
  address: '서울특별시 강남구 테헤란로 427',
  bannerImageUrl:
    'https://sprint-fe-project.s3.ap-northeast-2.amazonaws.com/globalnomad/activity_registration_image/a.png',
  subImages: [
    {
      id: 1,
      imageUrl:
        'https://sprint-fe-project.s3.ap-northeast-2.amazonaws.com/globalnomad/activity_registration_image/b.png',
    },
  ],
  schedules: [
    {
      id: 1,
      date: '2023-12-01',
      startTime: '12:00',
      endTime: '13:00',
    },
    {
      id: 2,
      date: '2023-12-05',
      startTime: '12:00',
      endTime: '13:00',
    },
  ],
  reviewCount: 1,
  rating: 4.74,
  createdAt: '2023-12-31T21:28:50.589Z',
  updatedAt: '2023-12-31T21:28:50.589Z',
};

const mockReviews = {
  averageRating: 0,
  totalCount: 0,
  reviews: [
    {
      id: 0,
      user: {
        profileImageUrl: 'string',
        nickname: '아무개',
        id: 0,
      },
      activityId: 0,
      rating: 3,
      content:
        '"저는 저희 스트릿 댄서 체험에 참가하게 된 지 얼마 안됐지만, 정말 즐거운 시간을 보냈습니다. 새로운 스타일과 춤추기를 좋아하는 나에게 정말 적합한 체험이었고, 전문가가 직접 강사로 참여하기 때문에 어떤 수준의 춤추는 사람도 쉽게 이해할 수 있었습니다. 강사님께서 정말 친절하게 설명해주셔서 정말 좋았고, 이번 체험을 거쳐 새로운 스타일과 춤추기에 대한 열정이 더욱 생겼습니다. 저는 이 체험을 적극 추천합니다!"',
      createdAt: '2025-07-15T18:28:41.527Z',
      updatedAt: '2025-07-15T18:28:41.527Z',
    },
  ],
};

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const ActivityPage = async ({ params }: Props) => {
  await params; // params validation
  return (
    <>
      {/* 모바일/태블릿용 레이아웃 */}
      <div className='flex max-w-1200 flex-col gap-20 lg:hidden'>
        <PhotoSection />

        {/* 배너 정보 */}
        <div>
          <div className='flex justify-between border-b-1 border-gray-100 pb-12'>
            <div className='flex flex-col'>
              <p className='text-13-m mb-4 text-gray-700'>{mock.category}</p>
              <h2 className='text-18-b mb-16 text-gray-950'>{mock.title}</h2>
              <div className='mb-10 flex gap-0.5'>
                <Image src={'/icons/icon_star_on.svg'} alt='별' width={16} height={16} />
                <p className='text-14-m text-gray-700'>
                  {mock.rating}({mock.reviewCount})
                </p>
              </div>
              <div className='flex gap-0.5'>
                <Image src={'/icons/icon_map.svg'} alt='지도 마크' width={16} height={16} />
                <p className='text-14-m text-gray-700'>{mock.address}</p>
              </div>
            </div>
            <DropdownMenu />
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className='flex flex-col gap-20'>
          {/* 체험 설명 */}
          <div className='flex flex-col gap-8 border-b-1 border-gray-100'>
            <h3 className='text-18-b text-gray-950'>체험 설명</h3>
            <p className='text-16-body-m mb-20 text-gray-950 md:mb-40'>{mock.description}</p>
          </div>

          {/* 오시는 길 */}
          <div className='flex flex-col gap-8 border-b-1 border-gray-100'>
            <h3 className='text-18-b text-gray-950'>오시는 길</h3>
            <p className='text-[14px] font-semibold text-gray-950'>{mock.address}</p>
            <MapView address={mock.address} />
          </div>

          {/* 체험 후기 */}
          <div className='flex flex-col items-center justify-center gap-8'>
            <h3 className='text-18-b self-start text-gray-950'>
              체험 후기{' '}
              <span className='text-[14px] font-semibold text-[#79747E]'>{mock.reviewCount}개</span>
            </h3>
            <p className='text-2xl font-semibold text-gray-950'>{mock.rating}</p>
            <p className='text-lg font-bold text-gray-950'>매우 만족</p>
            <div className='mb-10 flex items-center gap-0.5'>
              <Image src={'/icons/icon_star_on.svg'} alt='별' width={16} height={16} />
              <p className='text-14-body-m text-gray-700'>{mock.reviewCount}개 후기</p>
            </div>
            {mockReviews.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                nickname={review.user.nickname}
                rating={review.rating}
                content={review.content}
                createdAt='2025-07-10T06:45:09.546Z'
              />
            ))}
          </div>
        </div>

        {/* 예약 컴포넌트 */}
        <div>
          <ReservationContent />
        </div>
      </div>

      {/* 데스크톱용 레이아웃 */}
      <div className='hidden max-w-1200 grid-cols-[1fr_400px] gap-40 lg:grid'>
        {/* 좌측 콘텐츠 */}
        <div className='flex flex-col gap-40'>
          <PhotoSection />

          {/* 콘텐츠 영역 */}
          <div className='flex flex-col gap-20'>
            {/* 체험 설명 */}
            <div className='flex flex-col gap-8 border-b-1 border-gray-100'>
              <h3 className='text-18-b text-gray-950'>체험 설명</h3>
              <p className='text-16-body-m mb-20 text-gray-950 md:mb-40'>{mock.description}</p>
            </div>

            {/* 오시는 길 */}
            <div className='flex flex-col gap-8 border-b-1 border-gray-100'>
              <h3 className='text-18-b text-gray-950'>오시는 길</h3>
              <p className='text-[14px] font-semibold text-gray-950'>{mock.address}</p>
              <MapView address={mock.address} />
            </div>

            {/* 체험 후기 */}
            <div className='flex flex-col items-center justify-center gap-8'>
              <h3 className='text-18-b self-start text-gray-950'>
                체험 후기{' '}
                <span className='text-[14px] font-semibold text-[#79747E]'>
                  {mock.reviewCount}개
                </span>
              </h3>
              <p className='text-2xl font-semibold text-gray-950'>{mock.rating}</p>
              <p className='text-lg font-bold text-gray-950'>매우 만족</p>
              <div className='mb-10 flex items-center gap-0.5'>
                <Image src={'/icons/icon_star_on.svg'} alt='별' width={16} height={16} />
                <p className='text-14-body-m text-gray-700'>{mock.reviewCount}개 후기</p>
              </div>
              {mockReviews.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  nickname={review.user.nickname}
                  rating={review.rating}
                  content={review.content}
                  createdAt='2025-07-10T06:45:09.546Z'
                />
              ))}
            </div>
          </div>
        </div>

        {/* 우측 사이드바 */}
        <div className='flex flex-col gap-24'>
          {/* 배너 정보 */}
          <div>
            <div className='flex justify-between border-b-1 border-gray-100 pb-16'>
              <div className='flex flex-col'>
                <p className='text-13-m mb-4 text-gray-700'>{mock.category}</p>
                <h2 className='text-18-b mb-16 text-gray-950'>{mock.title}</h2>
                <div className='mb-10 flex gap-0.5'>
                  <Image src={'/icons/icon_star_on.svg'} alt='별' width={16} height={16} />
                  <p className='text-14-m text-gray-700'>
                    {mock.rating}({mock.reviewCount})
                  </p>
                </div>
                <div className='flex gap-0.5'>
                  <Image src={'/icons/icon_map.svg'} alt='지도 마크' width={16} height={16} />
                  <p className='text-14-m text-gray-700'>{mock.address}</p>
                </div>
              </div>
              <DropdownMenu />
            </div>
          </div>

          {/* 예약 컴포넌트 - sticky */}
          <div className='sticky top-20'>
            <ReservationContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityPage;
