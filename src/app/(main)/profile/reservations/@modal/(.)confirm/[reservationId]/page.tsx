'use client';
import CommonModal from '@/components/common/CancelModal';
import { cancelReservation } from '@/lib/api/profile/reservationList';
import { useRouter, useParams } from 'next/navigation';

const ConfirmModalPage = () => {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.reservationId;

  if (!reservationId || isNaN(Number(reservationId))) {
    throw new Error('올바르지 않은 예약 ID 입니다.');
  }
  const onDismiss = async () => {
    try {
      await cancelReservation(Number(reservationId));
      router.back();
    } catch {}
  };
  const onCancel = () => {
    router.back();
  };
  return (
    <CommonModal
      open={true}
      text='예약을 취소하시겠습니까?'
      onConfirm={onDismiss}
      onCancel={onCancel}
    />
  );
};

export default ConfirmModalPage;
