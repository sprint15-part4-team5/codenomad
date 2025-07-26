'use client';

import { useState, useEffect } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import ConfirmModal from '@/components/common/ConfirmModal';
import ModalTrigger from './ModalTrigger';
import DesktopCard from './DesktopCard';
import type { ActivityDetail, ReservationState } from '../Activities.types';
import { postReservation } from '@/lib/api/activities/index';
import axios from 'axios';

interface ReservationContentProps {
  activity: ActivityDetail;
}

const ReservationContent = ({ activity }: ReservationContentProps) => {
  const breakpoint = useResponsive();

  const [isClient, setIsClient] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
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
      alert('예약 날짜(스케줄)를 선택해주세요.');
      return;
    }
    // 주스탄드 도입 후 로그인 상태에 따라서 분기 처리 추가 예정 (토큰 없을 때 모달을 띄우고 로그인 페이지를 보내는 형식?)
    try {
      const payload = {
        scheduleId: data.scheduleId,
        headCount: data.headCount,
      };
      await postReservation(activity.id, payload);
      setIsConfirmModalOpen(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as { message?: string } | undefined;
        const message = errorData?.message || err.message || '예약에 실패했습니다.';
        alert(message);
      } else {
        alert('알 수 없는 에러가 발생했습니다.'); // 임시 alert
      }
    }
  };

  const handleConfirmModalClose = () => {
    setIsConfirmModalOpen(false);
    resetReservation();
  };

  const handleChangeSchedule = (id: number | null) => {
    setReservation((prev) => ({ ...prev, scheduleId: id }));
  };

  const handleChangeHeadCount = (count: number) => {
    const validCount = Math.max(1, count);
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
        message='예약이 완료되었습니다!'
        isOpen={isConfirmModalOpen}
        onClose={handleConfirmModalClose}
      />
    </>
  );
};

export default ReservationContent;
