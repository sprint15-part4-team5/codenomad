import instance from '../axios';
import type {
  ActivityDetail,
  ReviewResponse,
  ConfirmedReservation as ReservationRequest,
} from '@/components/activities/Activities.types';

// 임시 타입 (금일 회의 때 물어 보고 수정 예정)
export type ReservationStatus = 'pending' | 'confirmed' | 'declined' | 'canceled' | 'completed';

export interface ReservationResponse {
  id: number;
  teamId: string;
  userId: number;
  activityId: number;
  scheduleId: number;
  status: ReservationStatus;
  reviewSubmitted: boolean;
  totalPrice: number;
  headCount: number;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchActivitiesDetails = async (activityId: number): Promise<ActivityDetail> => {
  const res = await instance.get<ActivityDetail>(`/activities/${activityId}`);
  return res.data;
};

export const fetchActivityReviews = async (
  activityId: number,
  page = 1,
  size = 3,
): Promise<ReviewResponse> => {
  const res = await instance.get<ReviewResponse>(`/activities/${activityId}/reviews`, {
    params: { page, size },
  });
  return res.data;
};

export const postReservation = async (
  activityId: number,
  data: ReservationRequest,
): Promise<ReservationResponse> => {
  const res = await instance.post<ReservationResponse>(
    `/activities/${activityId}/reservations`,
    data,
  );
  return res.data;
};
