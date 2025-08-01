'use client';
import MobilePageHeader from '@/components/profile/common/MobilePageHeader';
import Badge from '@/components/reservationList/Badge';
import ReservationCard from '@/components/reservationList/ReservationCard';
import { StatusType } from '@/components/reservationList/reservations.types';
import { getReservationList } from '@/lib/api/profile/reservationList';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';

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
  const [isLoading, setIsLoading] = useState(false);
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
      if (res.cursorId === cursorId) {
        console.warn('Same cursorId returned, potential API issue');
      }
      if (res.reservations.length === 0 || res.cursorId === null) {
        setHasMore(false);
      } else {
        setReservationList((prev) => [...prev, ...res.reservations]);
        setCursorId(res.cursorId);
      }
    } catch (error) {
      console.error('Error fetching more data:', error);
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
    [hasMore, isLoading, fetchMoreData],
  );

  useEffect(() => {
    const getData = async () => {
      const res = await getReservationList();
      setReservationList(res.reservations);
      setCursorId(res.cursorId);
    };
    getData();
  }, []);

  useEffect(() => {
    if (!filter) return;

    const getFilteredData = async (status: StatusType) => {
      setIsLoading(true);
      setCursorId(null);
      setHasMore(true);
      const data = await getReservationList(null, status);
      setReservationList(data.reservations);
      setCursorId(data.cursorId);
      setIsLoading(false);
    };

    getFilteredData(filter);
  }, [filter]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0 });
    const currentEl = observerEl.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [handleObserver]);

  return (
    <div className='mx-auto flex w-full flex-col justify-center p-24 lg:px-126'>
      <h1 className='text-18-b text-gray-950'>
        <MobilePageHeader title='예약 내역' />
        예약 내역
      </h1>
      <h2 className='text-14-m my-10 text-gray-500'>예약 내역을 변경 및 취소 할 수 있습니다.</h2>

      <div className='scrollbar-hide overflow-x-scroll'>
        <div className='my-14 flex w-max grow-0 gap-8'>
          {statusList.map((item) => {
            return (
              <Badge
                key={item.value}
                setFilter={() => setFilter(item.value)}
                selected={filter === item.value}
              >
                {item.text}
              </Badge>
            );
          })}
        </div>
      </div>
      <div>
        {reservationList.length === 0 ? (
          filter === null ? (
            <div className='mt-40 flex flex-col items-center justify-center'>
              <div className='flex justify-center'>
                <Image src={'/imgs/earth.svg'} width={122} height={122} alt='우는 지구 이미지' />
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
          reservationList.map((item: reservationsType) => (
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
          ))
        )}
        {reservationList.length > 0 && hasMore && (
          <div ref={observerEl} className='h-10'>
            {isLoading && <span className='text-gray-500'>로딩중...</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
