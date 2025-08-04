'use client';
import LoadingSpinner from '@/components/profile/common/LoadingSpinner';
import MobilePageHeader from '@/components/profile/common/MobilePageHeader';
import Badge from '@/components/reservationList/Badge';
import ReservationCard from '@/components/reservationList/ReservationCard';
import { StatusType } from '@/components/reservationList/reservations.types';
import { getReservationList } from '@/lib/api/profile/reservationList';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface reservationsType {
  activity: {
    bannerImageUrl: string;
    id: number;
    title: string;
  };
  createdAt: string;
  date: string;
  endTime: string;
  headCount: number;
  id: number;
  reviewSubmitted: boolean;
  scheduleId: number;
  startTime: string;
  status: StatusType;
  teamId: string;
  totalPrice: number;
  updatedAt: string;
  userId: number;
}

const Page = () => {
  const [filter, setFilter] = useState<StatusType | null>(null);
  const [reservationList, setReservationList] = useState<reservationsType[]>([]);
  const [cursorId, setCursorId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 추가 데이터 로딩
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 초기 로딩
  const [hasMore, setHasMore] = useState(true);
  const observerEl = useRef<HTMLDivElement>(null);

  const statusList: { text: string; value: StatusType }[] = [
    { text: '예약 신청', value: 'pending' },
    { text: '예약 취소', value: 'canceled' },
    { text: '예약 승인', value: 'confirmed' },
    { text: '예약 거절', value: 'declined' },
    { text: '체험 완료', value: 'completed' },
  ];

  const fetchMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const res = await getReservationList(cursorId, filter ?? undefined);
      if (res.reservations.length === 0 || res.cursorId === null) {
        setHasMore(false);
      } else {
        setReservationList((prev) => [...prev, ...res.reservations]);
        setCursorId(res.cursorId);
      }
    } catch (error) {
      toast.error(`데이터를 더 불러오는데 실패했습니다: ${error}`);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [cursorId, hasMore, isLoading, filter]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore) {
        fetchMoreData();
      }
    },
    [hasMore, fetchMoreData],
  );

  useEffect(() => {
    const getData = async () => {
      setIsInitialLoading(true);
      try {
        const res = await getReservationList();
        setReservationList(res.reservations);
        setCursorId(res.cursorId);
      } finally {
        setIsInitialLoading(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (!filter) return;
    const getFilteredData = async (status: StatusType) => {
      setIsInitialLoading(true);
      setCursorId(null);
      setHasMore(true);
      try {
        const data = await getReservationList(null, status);
        setReservationList(data.reservations);
        setCursorId(data.cursorId);
      } finally {
        setIsInitialLoading(false);
      }
    };
    getFilteredData(filter);
  }, [filter]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0 });
    const currentEl = observerEl.current;
    if (currentEl) observer.observe(currentEl);

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [handleObserver]);

  return (
    <div className='mx-auto flex w-full flex-col justify-center p-24 lg:px-126'>
      <h1 className='text-18-b text-gray-950'>
        <MobilePageHeader
          title='예약 내역'
          description='예약 내역을 변경 및 취소 할 수 있습니다.'
        />
      </h1>

      <div className='scrollbar-hide overflow-x-scroll'>
        <div className='my-14 flex w-max grow-0 gap-8'>
          {statusList.map((item) => (
            <Badge
              key={item.value}
              setFilter={() => setFilter(item.value)}
              selected={filter === item.value}
            >
              {item.text}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        {isInitialLoading ? (
          <LoadingSpinner message='내 체험을 불러오는 중...' useLogo={true} />
        ) : reservationList.length === 0 ? (
          filter === null ? (
            <div className='mt-40 flex flex-col items-center justify-center'>
              <div className='flex justify-center'>
                <Image src={'/icons/404_kkot.svg'} width={122} height={122} alt='우는 꽃 이미지' />
              </div>
              <p className='text-18-m my-30 text-center text-gray-600'>아직 예약한 체험이 없어요</p>
              <Link
                href={'/'}
                className='bg-primary-500 text-16-b h-54 w-182 grow-0 rounded-2xl px-63 py-17 text-white'
              >
                둘러보기
              </Link>
            </div>
          ) : (
            <p className='mt-40 text-center text-gray-500'>해당 상태의 예약이 없습니다.</p>
          )
        ) : (
          <>
            {reservationList.map((item: reservationsType) => (
              <ReservationCard
                key={item.id}
                status={item.status}
                title={item?.activity?.title}
                startTime={item.startTime}
                date={item.date}
                endTime={item.endTime}
                price={item.totalPrice}
                headCount={item.headCount}
                bannerUrl={item.activity.bannerImageUrl}
                reservationId={item.id}
                reviewSubmitted={item.reviewSubmitted}
              />
            ))}
            {hasMore && (
              <div ref={observerEl} className='flex h-10 items-center justify-center'>
                {isLoading && <span className='text-gray-500'>추가 로딩중...</span>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
