'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import ExperienceCard from '@/components/profile/ExperienceCard';
import { getMyActivities, MyActivity, deleteMyActivity } from '@/lib/api/profile/my-activities';
import { ProfileMobileContext } from '../layout';
import { useContext } from 'react';

export default function MyExperiencesPage() {
  const [activities, setActivities] = useState<MyActivity[]>([]);
  const [cursorId, setCursorId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const mobileContext = useContext(ProfileMobileContext);

  const fetchActivities = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    try {
      const data = await getMyActivities(cursorId ?? undefined, 5);
      setActivities((prev) => {
        const ids = new Set(prev.map((a) => a.id));
        const newActivities = data.activities.filter((a) => !ids.has(a.id));
        return [...prev, ...newActivities];
      });
      setCursorId(
        data.activities.length > 0 ? data.activities[data.activities.length - 1].id : null,
      );
      setHasMore(data.activities.length > 0);
    } catch (err) {
      console.error('체험 목록을 가져오는데 실패했습니다:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cursorId, hasMore]);

  useEffect(() => {
    fetchActivities();
  }, []); // 초기 한 번만 호출

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchActivities();
        }
      },
      { threshold: 1.0 },
    );

    const loader = loaderRef.current;
    if (loader) {
      observer.observe(loader);
    }

    return () => {
      if (loader) {
        observer.unobserve(loader);
      }
    };
  }, [cursorId, hasMore]);

  // 삭제 핸들러
  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteMyActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <section className='mx-auto w-full max-w-2xl'>
      {/* 상단 타이틀/설명 */}
      <div className='relative mb-8 w-full'>
        {/* PC/태블릿: 타이틀+설명 세로 정렬 */}
        <div className='hidden md:flex md:flex-col'>
          <h1 className='mb-1 text-xl font-bold'>내 체험 관리</h1>
          <p className='mb-4 text-sm text-gray-500'>
            내 체험에 예약된 내역들을 한 눈에 확인할 수 있습니다.
          </p>
        </div>
        {/* PC/태블릿: 등록하기 버튼 */}
        <Link
          href='/experiences/add'
          className='absolute top-0 right-0 flex hidden h-[48px] w-[138px] items-center justify-center rounded-lg bg-blue-500 text-center text-base whitespace-nowrap text-white transition-colors hover:bg-blue-600 md:block'
        >
          <span className='flex h-full w-full items-center justify-center'>체험 등록하기</span>
        </Link>
        {/* 모바일: 아이콘+텍스트, 클릭 시 onCancel */}
        <button
          type='button'
          className='mb-1 block flex items-center gap-2 md:hidden'
          onClick={mobileContext?.onCancel}
          style={{ cursor: 'pointer' }}
        >
          <img src='/icons/Vector.png' alt='vector' width={20} height={20} />
          <span className='text-xl font-bold'>내 체험 관리</span>
          <p className='mb-4 text-sm text-gray-500'>
            내 체험에 예약된 내역들을 한 눈에 확인할 수 있습니다.
          </p>
        </button>
      </div>
      {/* 중앙 카드 스타일 콘텐츠 */}
      {activities.length === 0 && !isLoading ? (
        <div className='shadow-custom-5 mx-auto flex min-h-[40vh] w-full max-w-2xl flex-col items-center justify-center rounded-2xl bg-white p-4 md:p-8'>
          <img src='/icons/empty.svg' alt='empty' width={120} height={120} className='mb-6' />
          <p className='mb-4 text-lg text-gray-500'>아직 등록한 체험이 없어요</p>
          <Link
            href='/experiences/add'
            className='block flex h-[48px] w-[138px] items-center justify-center rounded-lg bg-blue-500 text-center text-base whitespace-nowrap text-white transition-colors hover:bg-blue-600 md:hidden'
          >
            <span className='flex h-full w-full items-center justify-center'>체험 등록하기</span>
          </Link>
        </div>
      ) : null}

      {/* 체험이 있을 때 ExperienceCard로 목록 렌더링 */}
      {activities.length > 0 && (
        <div className='flex w-full flex-col gap-6'>
          {activities.map((activity) => (
            <ExperienceCard
              key={activity.id}
              id={activity.id}
              title={activity.title}
              rating={activity.rating}
              reviews={activity.reviewCount}
              price={activity.price}
              image={activity.bannerImageUrl}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
