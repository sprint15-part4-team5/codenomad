import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface Activity {
  id: number;
  bannerImageUrl?: string;
  title: string;
  rating: number;
  reviewCount: number;
  price: number;
}

const LandingCard = ({ activity }: { activity: Activity }) => {
  const { id, bannerImageUrl, title, rating, reviewCount, price } = activity;
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/activities/${id}`)}
      className='relative aspect-[262/366] w-full cursor-pointer overflow-hidden rounded-xl transition-transform duration-200 hover:scale-105'
    >
      {/* 이미지 영역 */}
      <div className='relative aspect-[262/240] w-full overflow-hidden rounded-t-4xl'>
        <Image
          src={bannerImageUrl || '/imgs/thumbnail.jpg'}
          alt={bannerImageUrl ? `${title} 썸네일있음` : '썸네일 이미지 없음'}
          fill
          sizes='(min-width: 1024px) 16.375rem, (min-width: 640px) 20.75rem, 9.5rem'
          className='object-cover'
        />
      </div>

      {/* 텍스트 박스 */}
      <div className='absolute bottom-20 z-10 flex h-[35%] w-full flex-col items-start justify-center rounded-2xl bg-white px-12 md:rounded-4xl lg:px-30'>
        <h2 className='text-13-b sm:text-18-b mb-4 line-clamp-1'>{title}</h2>
        <div className='flex items-center gap-1'>
          <div className='relative mr-2 h-16 w-16'>
            <Image src='/icons/icon_star_on.svg' fill sizes='16px' alt='별 아이콘' />
          </div>
          <span className='text-12-m sm:text-14-m'>{rating}</span>
          <span className='text-12-m sm:text-14-m text-gray-400'>({reviewCount})</span>
        </div>
        <p className='text-14-b sm:text-18-b mt-10'>
          ₩{price.toLocaleString()}
          <strong className='text-12-m sm:text-16-m text-gray-400'> / 인</strong>
        </p>
      </div>
    </div>
  );
};

export default LandingCard;
