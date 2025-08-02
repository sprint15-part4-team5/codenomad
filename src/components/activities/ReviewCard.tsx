import StarRatingDisplay from './StarRatingDisplay';
import cn from '@/utils/cn';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ReviewCardProps {
  nickname: string;
  rating: number;
  content: string;
  createdAt: string;
  className?: string;
}

const ReviewCard = ({ nickname, rating, content, createdAt, className }: ReviewCardProps) => {
  const date = new Date(createdAt);
  const viewDate = format(date, 'yyyy.M.d', { locale: ko });
  return (
    <div
      className={cn(
        'shadow-custom-5 flex h-auto w-auto flex-col gap-12 rounded-3xl bg-white p-20',
        className,
      )}
    >
      <div className='flex flex-col justify-center gap-4'>
        <div className='flex items-center gap-8'>
          <p className='text-16-b text-gray-950'>{nickname}</p>
          <p className='text-16-b text-[#A4A1AA]'>{viewDate}</p>
        </div>
        <StarRatingDisplay rating={rating} />
      </div>
      <p className='text-14-body-m sm:text-16-body-m break-keep text-gray-950'>{content}</p>
    </div>
  );
};

export default ReviewCard;
