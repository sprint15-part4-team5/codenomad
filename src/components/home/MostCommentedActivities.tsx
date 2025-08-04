'use client';

import { useState, useEffect, useRef } from 'react';
import instance from '@/lib/api/axios';
import type { Activity } from './LandingCard';
import LandingCard from './LandingCard';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import LandingCardSkeleton from './LandingCardSkeleton';

const SCROLL_DELAY_MS = 2000;
const SCROLL_GAP_PX = 16;

const getCardWidth = () => {
  if (typeof window === 'undefined') return 152;
  const width = window.innerWidth;
  if (width >= 1024) return 262;
  if (width >= 640) return 332;
  return 152;
};

const MostCommentedActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMostCommentedActivities = async () => {
    try {
      const response = await instance.get('/activities', {
        params: {
          method: 'offset',
          sort: 'most_reviewed',
          page: 1,
          size: 10,
        },
      });
      setActivities(response.data.activities);
    } catch (error) {
      console.error('인기 체험 API 호출 실패:', error);
    }
  };

  useEffect(() => {
    fetchMostCommentedActivities();
  }, []);

  useAutoScroll(scrollRef, {
    getScrollStep: () => getCardWidth() + SCROLL_GAP_PX,
    delay: SCROLL_DELAY_MS,
  });

  return (
    <section className='mt-80 mb-60'>
      <h2 className='text-20-b md:text-24-b mb-30'>인기 체험</h2>
      <div
        ref={scrollRef}
        className='no-scrollbar flex gap-16 overflow-x-auto overflow-y-hidden sm:gap-24'
      >
        {activities.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='min-w-[9.5rem] sm:min-w-[20.75rem] lg:min-w-[16.375rem]'>
                <LandingCardSkeleton />
              </div>
            ))
          : activities.map((item) => (
              <div
                key={item.id}
                className='min-w-[9.5rem] sm:min-w-[20.75rem] lg:min-w-[16.375rem]'
              >
                <LandingCard activity={item} />
              </div>
            ))}
      </div>
    </section>
  );
};

export default MostCommentedActivities;
