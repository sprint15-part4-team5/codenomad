'use client';

import { useState, useEffect } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import ConfirmModal from '@/components/common/ConfirmModal';
import ModalTrigger from './ModalTrigger';
import DesktopCard from './DesktopCard';
import type { ActivityDetail, ReservationState } from '../Activities.types';
import { postReservation } from '@/lib/api/activities/index';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import showToastError from '@/lib/showToastError';

interface ReservationContentProps {
  activity: ActivityDetail;
}
const FALLBACK_MESSAGE = '예약 처리 중 문제가 발생했습니다.';

const ReservationContent = ({ activity }: ReservationContentProps) => {
  const breakpoint = useResponsive();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [needsLoginRedirect, setNeedsLoginRedirect] = useState(false);
  const [reservation, setReservation] = useState<ReservationState>({
    scheduleId: null,
    headCount: 1,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || breakpoint === null) return null;

  const resetReservation = () => {
    setReservation({
      scheduleId: null,
      headCount: 1,
    });
  };

  const handleReservationConfirm = async (data: ReservationState) => {
    if (data.scheduleId === null) {
      showToastError('예약 날짜(스케줄)를 선택해주세요.');
      return;
    }

    if (!user) {
      setNeedsLoginRedirect(true); // redirect 예약
      setIsConfirmModalOpen(true); // 모달 먼저 띄우기
      return;
    }
    try {
      const payload = {
        scheduleId: data.scheduleId,
        headCount: data.headCount,
      };
      await postReservation(activity.id, payload);
      setIsConfirmModalOpen(true);
    } catch (err) {
      showToastError(err, { fallback: FALLBACK_MESSAGE });
    }
  };

  const handleConfirmModalClose = () => {
    if (needsLoginRedirect) {
      setNeedsLoginRedirect(false);
      router.push('/login');
    }

    setIsConfirmModalOpen(false);
    resetReservation();
  };

  const handleChangeSchedule = (id: number | null) => {
    setReservation((prev) => ({ ...prev, scheduleId: id }));
  };

  const handleChangeHeadCount = (count: number) => {
    const validCount = Math.max(1, Math.min(100, count));
    setReservation((prev) => ({ ...prev, headCount: validCount }));
  };

  // 필요한 데이터만 추출
  const activityData = {
    schedules: activity.schedules,
    price: activity.price,
    title: activity.title,
  };

  const reservationControlProps = {
    scheduleId: reservation.scheduleId,
    headCount: reservation.headCount,
    onChangeSchedule: handleChangeSchedule,
    onChangeHeadCount: handleChangeHeadCount,
  };

  return (
    <>
      {breakpoint === 'lg' ? (
        <DesktopCard
          {...reservationControlProps}
          activityData={activityData}
          onReservationSubmit={handleReservationConfirm}
        />
      ) : (
        <ModalTrigger
          {...reservationControlProps}
          activityData={activityData}
          onReservationSubmit={handleReservationConfirm}
          onReservationReset={resetReservation} // 모달을 작성하다가 닫았을 때 필요
        />
      )}

      <ConfirmModal
        message={!user ? '로그인 후에 이용해주세요.' : '예약이 완료되었습니다!'}
        isOpen={isConfirmModalOpen}
        onClose={handleConfirmModalClose}
      />
    </>
  );
};

export default ReservationContent;
