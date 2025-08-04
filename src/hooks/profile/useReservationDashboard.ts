import { useState } from 'react';
import { getReservationDashboard, getReservedSchedule } from '@/lib/api/profile/myActivitiesStatus';
import type {
  ReservationCounts as ReservationCountData,
  DashboardItem,
  ScheduleFromApi,
  ScheduleData,
  DashboardData,
} from '@/components/profile/types';

// 🎣 예약 대시보드 관리 커스텀 훅
// 역할: 월별 예약 현황 데이터 로드 + fallback 처리 + 상태 관리
export const useReservationDashboard = () => {
  const [apiReservationData, setApiReservationData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🗓️ 월별 예약 대시보드 데이터 로드 (기존 로직 그대로)
  const loadReservationDashboard = async (activityId: number, year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);

      // 📅 API 요청을 위한 월 형식 맞추기 (01, 02, ... 12)
      const paddedMonth = month.toString().padStart(2, '0');
      const responseData = await getReservationDashboard(activityId, String(year), paddedMonth);

      // 🔄 API 응답을 캘린더가 이해할 수 있는 형태로 변환
      const dashboardData: DashboardData = {};

      if (Array.isArray(responseData)) {
        (responseData as DashboardItem[]).forEach((item: DashboardItem) => {
          if (item.date && item.reservations) {
            // 📊 이미 집계된 데이터를 그대로 사용 (pending, confirmed, declined 개수)
            dashboardData[item.date] = [
              {
                id: 'dashboard', // 임시 ID (실제 스케줄 ID 아님)
                timeSlot: '시간 미정', // 대시보드에서는 구체적 시간 정보 없음
                startTime: '시간',
                endTime: '미정',
                reservations: [item], // 📈 집계 데이터 보존
                headCount: 0,
              },
            ];
          }
        });
      }

      setApiReservationData(dashboardData);

      // 🎯 추가 작업: 각 날짜별로 정확한 상태 정보 로드 (fallback 포함)
      // getReservationDashboard는 개요만 제공하므로, 정확한 뱃지를 위해 추가 API 호출
      await loadStatusBadgesWithReservedSchedule(
        activityId,
        Object.keys(dashboardData),
        dashboardData,
      );
    } catch {
      setError('예약 현황을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✨ 핵심 함수: 각 날짜별 정확한 예약 상태 뱃지 정보 로드 (복잡한 fallback 로직 포함)
  // 역할: getReservedSchedule API로 정확한 상태를 가져오되, 실패시 dashboardData를 fallback으로 사용
  // 추가 기능: 시간 경과에 따른 승인→완료 상태 자동 변환
  const loadStatusBadgesWithReservedSchedule = async (
    activityId: number,
    dates: string[],
    dashboardData: DashboardData,
  ) => {
    try {
      const statusBadgeData: { [date: string]: ReservationCountData } = {};

      for (const date of dates) {
        try {
          const schedules = await getReservedSchedule(activityId, date);
          const dateCounts = { pending: 0, confirmed: 0, declined: 0, completed: 0 };

          if (schedules.length === 0) {
            const fallbackData = dashboardData[date];
            if (fallbackData && fallbackData.length > 0) {
              fallbackData.forEach((schedule) => {
                if (schedule.reservations && Array.isArray(schedule.reservations)) {
                  schedule.reservations.forEach((reservationGroup) => {
                    if (
                      (reservationGroup as DashboardItem).reservations &&
                      typeof (reservationGroup as DashboardItem).reservations === 'object'
                    ) {
                      const counts = (reservationGroup as DashboardItem).reservations;
                      dateCounts.pending += counts.pending || 0;
                      dateCounts.confirmed += counts.confirmed || 0;
                      dateCounts.declined += counts.declined || 0;
                      dateCounts.completed += counts.completed || 0;
                    }
                  });
                }
              });
            }
          } else {
            (schedules as ScheduleFromApi[]).forEach((schedule: ScheduleFromApi) => {
              if (schedule.count) {
                dateCounts.pending += schedule.count.pending || 0;
                dateCounts.confirmed += schedule.count.confirmed || 0;
                dateCounts.declined += schedule.count.declined || 0;
              }
            });
          }

          const now = new Date();
          const schedulesToCheck: (ScheduleFromApi | ScheduleData)[] =
            schedules.length > 0 ? (schedules as ScheduleFromApi[]) : dashboardData[date] || [];

          schedulesToCheck.forEach((schedule: ScheduleFromApi | ScheduleData) => {
            const isApiSchedule = 'count' in schedule;
            const hasConfirmed = isApiSchedule
              ? (schedule as ScheduleFromApi).count &&
                (schedule as ScheduleFromApi).count!.confirmed > 0
              : dateCounts.confirmed > 0;

            if (hasConfirmed) {
              const endTime = schedule.endTime || '23:59';
              const scheduleEndDateTime = new Date(`${date} ${endTime}`);

              if (now > scheduleEndDateTime) {
                const confirmedCount = isApiSchedule
                  ? (schedule as ScheduleFromApi).count?.confirmed || 0
                  : dateCounts.confirmed;

                dateCounts.confirmed -= confirmedCount;
                dateCounts.completed += confirmedCount;
              }
            }
          });

          statusBadgeData[date] = dateCounts;
        } catch {
          // 개별 날짜 처리 실패는 조용히 처리
        }
      }

      if (typeof window !== 'undefined') {
        window.statusBadgeData = statusBadgeData;
      }

      if (Object.keys(statusBadgeData).length > 0) {
        setApiReservationData((prev) => ({ ...prev }));
      }
    } catch {
      // 전체 처리 실패는 조용히 처리
    }
  };

  return {
    // 📊 상태들
    apiReservationData,
    loading,
    error,

    // 🎯 액션들
    loadReservationDashboard,
    loadStatusBadgesWithReservedSchedule,
  };
};
