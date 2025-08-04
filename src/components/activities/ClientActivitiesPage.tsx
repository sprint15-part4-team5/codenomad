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
import ErrorFallback from '@/components/activities/ErrorFallback';
import ResponsiveActivityPageSkeleton from '@/components/activities/ResponsiveActivityPageSkeleton';

import type { ActivityDetail } from '@/components/activities/Activities.types';

interface ClientActivitiesPageProps {
  id: number;
}

const FALLBACK_MESSAGE = '데이터를 불러오지 못했습니다.';

const ClientActivitiesPage = ({ id }: ClientActivitiesPageProps) => {
  const screenSize = useResponsive();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();

  const isDesktop = screenSize === 'lg';

  useEffect(() => {
    const loadActivity = async () => {
      try {
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

  if (!loading) return <ResponsiveActivityPageSkeleton />;
  if (!activity) return <ErrorFallback />;

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
