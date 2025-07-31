'use client';

import { useParams, useSearchParams } from 'next/navigation';
import ReviewModal from '@/components/reservationList/ReviewModal';

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();

  const reservationId = params?.reservationId as string;
  const title = searchParams.get('title');
  const date = searchParams.get('date');
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const headCount = searchParams.get('headCount');

  if (!reservationId || isNaN(Number(reservationId))) {
    throw new Error('올바르지 않은 예약 ID입니다.');
  }

  if (!title || !date || !startTime || !endTime || !headCount) {
    throw new Error('필수 예약 정보가 누락되었습니다.');
  }

  const numericHeadCount = Number(headCount);
  const numericReservationId = Number(reservationId);

  if (isNaN(numericHeadCount) || isNaN(numericReservationId)) {
    throw new Error('올바르지 않은 숫자 형식입니다.');
  }

  return (
    <ReviewModal
      title={title}
      date={date}
      startTime={startTime}
      endTime={endTime}
      headCount={numericHeadCount}
      reservationId={numericReservationId}
    />
  );
}
