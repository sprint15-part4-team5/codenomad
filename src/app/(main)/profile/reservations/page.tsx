'use client';
import Badge from '@/components/reservationList/Badge';
import ReservationCard from '@/components/reservationList/ReservationCard';
import { StatusType } from '@/components/reservationList/StatusBadge';
import { useState } from 'react';

const Page = () => {
  const [filter, setFilter] = useState<StatusType | null>(null);
  const statusList: { text: string; value: StatusType }[] = [
    { text: '예약 신청', value: 'pending' },
    { text: '예약 취소', value: 'canceled' },
    { text: '예약 승인', value: 'confirmed' },
    { text: '예약 거절', value: 'declined' },
    { text: '체험 완료', value: 'completed' },
  ];
  return (
    <div className='flex w-full flex-col p-24'>
      <h1 className='text-18-b text-gray-950'>예약 내역</h1>
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
      <ReservationCard
        status='pending'
        title='title'
        date='0000.00.00'
        startTime='11:00'
        endTime='12:00'
        price={35000}
        headCount={30}
      />
      <ReservationCard
        status='completed'
        title='title'
        date='0000.00.00'
        startTime='11:00'
        endTime='12:00'
        price={35000}
        headCount={30}
      />
      <ReservationCard
        status='confirmed'
        title='title'
        date='0000.00.00'
        startTime='11:00'
        endTime='12:00'
        price={35000}
        headCount={30}
      />
    </div>
  );
};

export default Page;
