import Image from 'next/image';
import Link from 'next/link';

interface ExperienceCardProps {
  id: number;
  title: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  onDelete?: (id: number) => void; // 추가
}

export default function ExperienceCard({
  id,
  title,
  rating,
  reviews,
  price,
  image,
  onDelete,
}: ExperienceCardProps) {
  return (
    <div className='shadow-custom-5 mx-auto flex h-178 w-327 items-center gap-5 rounded-2xl bg-white p-5 md:h-159 md:w-476 lg:h-202 lg:w-640'>
      {/* 내용 */}
      <div className='mt-40 ml-30 flex h-full flex-1 flex-col justify-between'>
        <div>
          <div className='mb-5 text-xl leading-tight font-bold break-keep'>{title}</div>
          <div className='text-14-m mb-5 flex items-center gap-1 text-gray-500'>
            <span className='text-16 text-yellow-400'>★</span>
            <span>{rating}</span>
            <span className='text-12-m mb-5 text-gray-400'>({reviews})</span>
          </div>
          <div className='mt-1'>
            <span className='text-xl font-bold text-black'>₩{price.toLocaleString()}</span>
            <span className='text-14-m ml-1 text-gray-400'>/ 인</span>
          </div>
        </div>
        <div className='mb-40 flex gap-8'>
          <Link href={`/experiences/edit/${id}`}>
            <button className='text-14-m h-30 w-70 rounded-lg border border-yellow-600 bg-yellow-100 text-yellow-600'>
              수정하기
            </button>
          </Link>
          <button
            className='text-14-m h-30 w-70 rounded-lg border border-red-600 bg-red-100 text-red-600'
            onClick={() => onDelete && onDelete(id)}
          >
            삭제하기
          </button>
        </div>
      </div>
      {/* 썸네일 */}
      <div className='mr-30 h-80 w-80 flex-shrink-0 overflow-hidden rounded-xl md:h-100 md:w-100 lg:h-120 lg:w-120'>
        <Image
          src={image}
          alt='썸네일'
          width={120}
          height={120}
          className='h-full w-full object-cover'
        />
      </div>
    </div>
  );
}
