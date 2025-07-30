'use client';

import PhotoSection from '@/components/activities/PhotoSection';
import clsx from 'clsx';
import DropdownMenu from '@/components/activities/ActivitesDropdown';
import ReservationContent from '@/components/activities/ReservationFlow/ReservationContent';
import MapView from '@/components/activities/MapView';
import Image from 'next/image';
import { useResponsive } from '@/hooks/useResponsive';
import { useState, useEffect } from 'react';
import ReviewSection from '@/components/activities/ReviewSection';
import type { ActivityDetail } from '@/components/activities/Activities.types';
import { fetchActivitiesDetails } from '@/lib/api/activities/index';
import { useAuthStore } from '@/store/useAuthStore';

interface ClientActivitiesPageProps {
  id: number;
}

const ClientActivitiesPage = ({ id }: ClientActivitiesPageProps) => {
  const screenSize = useResponsive();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        const res = await fetchActivitiesDetails(id);
        setActivity(res);
        console.log(activity);
      } catch (err) {
        console.error('데이터 불러오기 실패', err); // 추후 not-found나 error 페이지 작성 시 변경 예정
        setActivity(null); // 또는 fallback
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id]);

  if (loading) return <p>로딩 중...</p>;
  if (!activity) return null; // 추후 조건부 렌더링으로 스켈레톤 적용 예정

  const isDesktop = screenSize === 'lg';

  const isOwner = user?.id === activity.userId;

  return (
    <>
      {/* 상단 공통 이미지 */}
      <PhotoSection bannerImages={activity.bannerImageUrl} subImages={activity.subImages} />

      <div className={clsx('w-full', isDesktop ? 'flex gap-40' : 'flex flex-col gap-20')}>
        {/* 본문 */}
        <article className='flex flex-1 flex-col gap-40'>
          <header className='flex justify-between border-b-1 border-gray-100 pb-12'>
            <div className='flex flex-col'>
              <p className='text-13-m mb-4 text-gray-700'>{activity.category}</p>
              <h1 className='text-18-b mb-16 text-gray-950'>{activity.title}</h1>
              <div className='mb-10 flex gap-0.5'>
                <Image src='/icons/icon_star_on.svg' alt='별' width={16} height={16} />
                <p className='text-14-m text-gray-700'>
                  {activity.rating}({activity.reviewCount})
                </p>
              </div>
              <div className='flex gap-0.5'>
                <Image src='/icons/icon_map.svg' alt='지도 마크' width={16} height={16} />
                <p className='text-14-m text-gray-700'>{activity.address}</p>
              </div>
            </div>
            {isOwner && <DropdownMenu activityId={id} />}
          </header>

          <section className='flex flex-col gap-8 border-b-1 border-gray-100'>
            <h2 className='text-18-b text-gray-950'>체험 설명</h2>
            <p className='text-16-body-m mb-20 text-gray-950 md:mb-40'>{activity.description}</p>
          </section>

          <section className='flex flex-col gap-8 border-b-1 border-gray-100'>
            <h2 className='text-18-b text-gray-950'>오시는 길</h2>
            <p className='text-[0.875rem] font-semibold text-gray-950'>{activity.address}</p>
            <MapView address={activity.address} category={activity.category} />
          </section>

          <ReviewSection activityId={id} />
        </article>

        {/* 예약 영역 */}
        <section
          className={clsx(
            'flex flex-col gap-24',
            isDesktop ? 'sticky top-[6.25rem] w-[25.625rem] self-start' : 'mt-20',
          )}
        >
          <ReservationContent activity={activity} />
        </section>
      </div>
    </>
  );
};

export default ClientActivitiesPage;
