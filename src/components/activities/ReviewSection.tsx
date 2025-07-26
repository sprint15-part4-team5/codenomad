'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Pagination from '@/components/common/Pagination';
import ReviewCard from '@/components/activities/ReviewCard';
import type { ReviewResponse } from './Activities.types';
import { fetchActivityReviews } from '@/lib/api/activities/index';

interface ReviewSectionProps {
  activityId: number;
}

const PAGE_SIZE = 3;
const INITIAL_REVIEW_PAGE = 1;

const ReviewSection = ({ activityId }: ReviewSectionProps) => {
  const [currentPage, setCurrentPage] = useState(INITIAL_REVIEW_PAGE);
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchActivityReviews(activityId, currentPage, PAGE_SIZE);
        setReviewData(data);
      } catch (err) {
        setReviewData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activityId, currentPage]);

  // 임시 처리
  if (loading) return <p>로딩 중...</p>;
  if (!reviewData) return <p> 리뷰를 불러오지 못하였습니다. </p>;

  const totalPages = Math.ceil(reviewData.totalCount / PAGE_SIZE);

  const getSatisfactionText = (rating: number) => {
    if (rating >= 4.5) return '매우 만족';
    if (rating >= 3.5) return '만족';
    if (rating >= 2.5) return '보통';
    if (rating >= 1.5) return '불만족';
    return '매우 불만족';
  };

  if (reviewData.totalCount === 0) {
    return (
      <section className='flex flex-col items-center justify-center gap-8'>
        <h2 className='text-18-b self-start text-gray-950'>
          체험 후기 <span className='text-[0.875rem] font-semibold text-[#79747E]'>0개</span>
        </h2>
        <p className='text-lg font-bold text-gray-950'>후기가 없습니다.</p>
        <div className='mb-10 flex items-center gap-0.5'>
          <Image src='/icons/icon_star_on.svg' alt='별' width={16} height={16} />
          <p className='text-14-body-m text-gray-700'>0개 후기</p>
        </div>
        <div className='w-full py-10 text-center text-gray-500'>아직 후기가 없습니다.</div>
      </section>
    );
  }

  return (
    <section className='flex flex-col items-center justify-center gap-8'>
      {/* 후기 요약 헤더 */}
      <h2 className='text-18-b self-start text-gray-950'>
        체험 후기{' '}
        <span className='text-[0.875rem] font-semibold text-[#79747E]'>
          {reviewData.totalCount}개
        </span>
      </h2>
      <p className='text-2xl font-semibold text-gray-950'>{reviewData.averageRating}</p>
      <p className='text-lg font-bold text-gray-950'>
        {getSatisfactionText(reviewData.averageRating)}
      </p>

      <div className='mb-10 flex items-center gap-0.5'>
        <Image src='/icons/icon_star_on.svg' alt='별' width={16} height={16} />
        <p className='text-14-body-m text-gray-700'>{reviewData.totalCount}개 후기</p>
      </div>

      {/* 후기 리스트 */}
      <div className='flex w-full flex-col gap-20'>
        {reviewData.reviews.map((review) => (
          <article key={review.id}>
            <ReviewCard
              nickname={review.user.nickname}
              rating={review.rating}
              content={review.content}
              createdAt={review.createdAt}
            />
          </article>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
};

export default ReviewSection;
