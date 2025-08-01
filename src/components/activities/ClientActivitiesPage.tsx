'use client';

import clsx from 'clsx';
import showToastError from '@/lib/showToastError';
import { useState, useEffect } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { fetchActivitiesDetails } from '@/lib/api/activities';
import { useAuthStore } from '@/store/useAuthStore';

import ActivityPhotoSection from '@/components/activities/sections/ActivityPhotoSection';
import ActivityHeader from '@/components/activities/sections/ActivityHeader';
import ActivityDescription from '@/components/activities/sections/ActivityDescription';
import ActivityMapSection from '@/components/activities/sections/ActivityMapSection';
import ActivityReviewSection from '@/components/activities/sections/ActivityReviewSection';
import ReservationContent from '@/components/activities/ReservationFlow/ReservationContent';

import type { ActivityDetail } from '@/components/activities/Activities.types';
import Image from 'next/image';

interface ClientActivitiesPageProps {
  id: number;
}

const FALLBACK_MESSAGE = '데이터를 불러오지 못했습니다.';

const ClientActivitiesPage = ({ id }: ClientActivitiesPageProps) => {
  const screenSize = useResponsive();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();

  const isDesktop = screenSize === 'lg';

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        const res = await fetchActivitiesDetails(id);
        setActivity(res);
      } catch (err) {
        showToastError(err, { fallback: FALLBACK_MESSAGE });
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id]);

  if (loading) return <p>로딩 중...</p>;
  if (!activity)
    return (
      <div className='flex min-h-[80vh] flex-col items-center justify-center gap-24'>
        <div className='relative size-300'>
          <Image alt='에러 이미지' src={'/icons/404_kkot.svg'} fill />
        </div>
        <h1 className='text-14-b md:text-18-b text-center text-gray-500'>
          데이터를 불러오지 못했습니다. <br />
          잠시 후 다시 시도해주세요.
        </h1>
        <button
          className='bg-primary-500 text-14-m h-50 w-250 self-center rounded-2xl text-white md:w-300'
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
      </div>
    );

  const isOwner = user?.id === activity.userId;

  return (
    <>
      <ActivityPhotoSection bannerImages={activity.bannerImageUrl} subImages={activity.subImages} />

      <div className={clsx('w-full', isDesktop ? 'flex gap-40' : 'flex flex-col gap-20')}>
        <article className='flex flex-1 flex-col gap-40'>
          <ActivityHeader activity={activity} isOwner={isOwner} activityId={id} />
          <ActivityDescription text={activity.description} />
          <ActivityMapSection address={activity.address} category={activity.category} />
          <ActivityReviewSection activityId={id} />
        </article>

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
