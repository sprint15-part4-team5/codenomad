'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Pagination from '@/components/common/Pagination';
import ReviewCard from '@/components/activities/ReviewCard';
import type { ReviewResponse } from '../Activities.types';
import { fetchActivityReviews } from '@/lib/api/activities/index';
import getSatisfactionText from '@/utils/activities/getSatisfactionText';

interface ActivityReviewSectionProps {
  activityId: number;
}

const PAGE_SIZE = 3;
const INITIAL_REVIEW_PAGE = 1;

const ActivityReviewSection = ({ activityId }: ActivityReviewSectionProps) => {
  const [currentPage, setCurrentPage] = useState(INITIAL_REVIEW_PAGE);
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchActivityReviews(activityId, currentPage, PAGE_SIZE);
      setReviewData(data);
    } catch {
      setReviewData(null);
    } finally {
      setLoading(false);
    }
  }, [activityId, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 임시 처리
  if (loading) return <p>로딩 중...</p>;
  if (!reviewData)
    return (
      <section className='flex flex-col items-center justify-center gap-8'>
        <h2 className='text-18-b self-start text-gray-950'>
          체험 후기 <span className='text-[0.875rem] font-semibold text-[#79747E]'>0개</span>
        </h2>
        <p className='text-lg font-bold text-gray-950'>리뷰를 불러오지 못하였습니다.</p>
        <div className='mb-10 flex items-center gap-0.5'>
          <Image src='/icons/icon_star_on.svg' alt='별' width={16} height={16} />
          <p className='text-14-body-m text-gray-700'>0개 후기</p>
        </div>
        <div className='w-full py-10 text-center text-gray-500'>리뷰를 불러오지 못하였습니다.</div>
        <button
          className='bg-primary-500 text-14-m h-40 w-300 rounded-2xl text-white'
          onClick={() => fetchData()}
        >
          다시 불러오기
        </button>
      </section>
    );

  const totalPages = Math.ceil(reviewData.totalCount / PAGE_SIZE);

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
      <p className='text-2xl font-semibold text-gray-950'>{reviewData.averageRating.toFixed(1)}</p>
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

export default ActivityReviewSection;
