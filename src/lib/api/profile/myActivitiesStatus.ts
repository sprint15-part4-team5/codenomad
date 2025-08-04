import instance from '../axios';

// 월별 예약 현황 조회
export async function getReservationDashboard(activityId: number, year: string, month: string) {
  const res = await instance.get(`/my-activities/${activityId}/reservation-dashboard`, {
    params: { year, month },
  });
  return res.data;
}

// 날짜별 예약 스케줄 조회
export async function getReservedSchedule(activityId: number, date: string) {
  const res = await instance.get(`/my-activities/${activityId}/reserved-schedule`, {
    params: { date },
  });
  return res.data;
}

// 시간대별 예약 내역 조회 (scheduleId 쿼리)
export async function getReservations(
  activityId: number,
  scheduleId: number,
  status: string = 'pending',
) {
  const res = await instance.get(`/my-activities/${activityId}/reservations`, {
    params: {
      scheduleId: scheduleId,
      status: status,
    },
  });
  return res.data;
}

// 예약 상태 변경 (승인/거절)
export async function updateReservationStatus(
  activityId: number,
  reservationId: number,
  status: 'confirmed' | 'declined',
) {
  const res = await instance.patch(`/my-activities/${activityId}/reservations/${reservationId}`, {
    status,
  });
  return res.data;
}
