'use client';

import StarRatingDisplay from './StarRatingDisplay';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import cn from '@/utils/cn';

interface ReviewCardProps {
  nickname: string;
  rating: number;
  content: string;
  createdAt: string;
  className?: string;
  disableExpand?: boolean;
}

const MAX_HEIGHT = 80; // 3줄 정도의 높이

const ReviewCard = ({ nickname, rating, content, createdAt, className, disableExpand = false }: ReviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const measureRef = useRef<HTMLDivElement>(null);
  const date = new Date(createdAt);
  const viewDate = format(date, 'yyyy.M.d', { locale: ko });

  const checkTextHeight = useCallback(() => {
    if (!measureRef.current || disableExpand) return;
    const height = measureRef.current.scrollHeight;
    setIsOverflowing(height > MAX_HEIGHT);
  }, [disableExpand]);

  useEffect(() => {
    if (!disableExpand) {
      checkTextHeight(); // 바로 측정
    }
  }, [content, checkTextHeight, disableExpand]);

  useEffect(() => {
    if (!measureRef.current || disableExpand) return;
    const observer = new ResizeObserver(() => {
      checkTextHeight();
    });
    observer.observe(measureRef.current);
    return () => observer.disconnect();
  }, [checkTextHeight, disableExpand]);
  return (
    <div className={cn('shadow-custom-5 flex h-auto w-auto flex-col gap-12 rounded-3xl bg-white p-20', className)}>
      <div className='flex flex-col justify-center gap-4'>
        <div className='flex items-center gap-8'>
          <p className='text-16-b text-gray-950'>{nickname}</p>
          <p className='text-16-b text-[#A4A1AA]'>{viewDate}</p>
        </div>
        <StarRatingDisplay rating={rating} />
      </div>

      {/* 텍스트 콘텐츠 영역 */}
      <div
        ref={measureRef}
        className={cn(
          'relative',
          !disableExpand && isOverflowing && !isExpanded && 'max-h-[4.5rem] overflow-hidden'
        )}
      >
        <p className='text-14-body-m sm:text-16-body-m break-words whitespace-pre-line text-gray-950'>
          {content}
        </p>
        {!disableExpand && isOverflowing && !isExpanded && (
          <div className='absolute right-0 bottom-0 left-0 h-8 w-full bg-gradient-to-t from-white to-transparent' />
        )}
      </div>
      {!disableExpand && isOverflowing && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className='text-12-m flex h-8 w-fit items-center justify-center gap-1 self-start rounded-lg p-10 text-gray-950'
        >
          {!isExpanded ? '더보기' : '간략히'}
          <Image
            src={!isExpanded ? '/icons/icon_alt arrow_down.svg' : '/icons/icon_alt arrow_up.svg'}
            alt={!isExpanded ? '더보기' : '간략히'}
            width={25}
            height={25}
          />
        </button>
      )}
    </div>
  );
};

export default ReviewCard;
