'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import RatingStar from './RatingStar';
import { postReview } from '@/lib/api/profile/reservationList';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { reviewRequestSchema, ReviewType } from '@/lib/schema/reservationsSchema';
import showToastError from '@/lib/showToastError';
import { toast } from 'sonner';

interface ReviewModalType {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  headCount: number;
  reservationId: number;
}

const ReviewModal = ({
  title,
  date,
  startTime,
  endTime,
  headCount,
  reservationId,
}: ReviewModalType) => {
  const defaultValue = {
    rating: 1,
    content: '',
  };
  const { register, handleSubmit, watch } = useForm({
    resolver: zodResolver(reviewRequestSchema),
    defaultValues: defaultValue,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const rating = watch('rating');
  const content = watch('content');
  const letterCount = content.length;

  useEffect(() => {
    document.body.style = 'overflow: hidden;';
  }, []);

  function onDismiss() {
    router.back();
    document.body.style.overflow = 'auto';
  }
  const goCancelModal = () => {
    router.push('/profile/reservations/exit');
  };

  const submitReview = async (data: ReviewType) => {
    try {
      setIsSubmitting(true);
      await postReview(reservationId, data);
      toast.success('리뷰 작성에 성공했습니다!');
      window.location.href = '/profile/reservations';
      document.body.style.overflow = 'auto';
    } catch (error) {
      showToastError(error);
    }
  };
  return (
    <div
      className='fixed top-0 left-0 z-50 h-screen w-screen bg-black/50'
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onDismiss();
        }
      }}
    >
      <dialog
        open
        ref={dialogRef}
        className='inset-0 m-auto flex w-327 flex-col rounded-[1.875rem] px-24 py-20 md:w-385'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='text-right'>
          <button onClick={goCancelModal} className='close-button'>
            <Image src='/icons/icon_delete.svg' width={24} height={24} alt='exit_icon'></Image>
          </button>
        </div>
        <h1 className='text-14-b md:text-16-b truncate text-center text-gray-950'>{title}</h1>
        <div className='text-13-m md:text-14-m text-center text-gray-500'>
          <span>{date} /</span>
          <span>
            {startTime} - {endTime} ({headCount}명)
          </span>
        </div>
        <div className='relative m-auto mt-14 mb-20'>
          <RatingStar rating={Number(rating)} />
          <input
            className='input-range absolute top-0 h-36 w-full opacity-0 md:h-42'
            type='range'
            min={1}
            max={5}
            step={1}
            {...register('rating')}
          ></input>
        </div>
        <form
          id='review'
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit((data) => {
            submitReview(data);
          })}
        >
          <h2 className='text-16-b md:text-18-b mb-12 text-gray-950'>소중한 경험을 들려주세요</h2>
          <textarea
            className='text-14-body-m md:text-16-m h-179 w-full resize-none rounded-xl border-1 border-gray-100 p-20 text-gray-950 placeholder:text-gray-400'
            placeholder='체험에서 느낀 경험을 자유롭게 남겨주세요'
            maxLength={100}
            {...register('content')}
          ></textarea>
          <p className='text-13-m md:text-14-m mt-8 mb-20 text-right text-gray-600'>
            {letterCount}/100
          </p>
          <button
            form='review'
            type='submit'
            className={
              'md:text-16-b bg-primary-500 text-14-b w-full rounded-xl py-12 text-white disabled:bg-gray-300 md:py-17'
            }
            disabled={isSubmitting || content.length === 0}
          >
            {isSubmitting ? '제출 중...' : '작성하기'}
          </button>
        </form>
      </dialog>
    </div>
  );
};

export default ReviewModal;
