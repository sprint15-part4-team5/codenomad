import { StatusType } from '@/components/reservationList/StatusBadge';
import instance from '@/lib/api/axios';
import { ReviewType } from '@/lib/schema/reservationsSchema';

export const getReservationList = async (
  cursorId: number | null = null,
  status: StatusType | null = null,
) => {
  const params = new URLSearchParams({ size: '2' });
  if (cursorId !== null) params.append('cursorId', cursorId.toString());
  if (status !== null) params.append('status', status);

  const res = await instance.get(`my-reservations?${params.toString()}`);
  return res.data;
};

export const cancelReservation = async (reservationId: number) => {
  try {
    const res = await instance.patch(`my-reservations/${reservationId}`, {
      status: 'canceled',
    });
    return res;
  } catch (err) {
    throw err;
  }
};

export const postReview = async (reservationId: number, data: ReviewType) => {
  const res = await instance.post(`my-reservations/${reservationId}/reviews`, data);
  return res.data;
};
