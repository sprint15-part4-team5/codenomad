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

      console.log('🎯 getReservationDashboard 원본 응답:', JSON.stringify(responseData, null, 2));

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
            console.log(`📊 ${item.date} 처리 완료:`, item.reservations);
          }
        });
      }

      console.log('✅ 최종 apiReservationData:', JSON.stringify(dashboardData, null, 2));
      console.log('📅 포함된 날짜들:', Object.keys(dashboardData));

      setApiReservationData(dashboardData);

      // 🎯 추가 작업: 각 날짜별로 정확한 상태 정보 로드 (fallback 포함)
      // getReservationDashboard는 개요만 제공하므로, 정확한 뱃지를 위해 추가 API 호출
      await loadStatusBadgesWithReservedSchedule(
        activityId,
        Object.keys(dashboardData),
        dashboardData,
      );
    } catch (err) {
      setError('예약 현황을 불러오는데 실패했습니다.');
      console.error('Failed to load reservation dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✨ 핵심 함수: 각 날짜별 정확한 예약 상태 뱃지 정보 로드 (복잡한 fallback 로직 포함)
  // 역할: getReservedSchedule API로 정확한 상태를 가져오되, 실패시 dashboardData를 fallback으로 사용
  // 추가 기능: 시간 경과에 따른 승인→완료 상태 자동 변환
  const loadStatusBadgesWithReservedSchedule = async (
    activityId: number,
    dates: string[], // 처리할 날짜 목록 (예: ["2024-01-15", "2024-01-16"])
    dashboardData: DashboardData, // fallback용 대시보드 데이터
  ) => {
    try {
      console.log('🚀 loadStatusBadgesWithReservedSchedule 시작');
      console.log('📋 받은 dates 매개변수:', dates);
      console.log('🗂️ 전달받은 dashboardData:', JSON.stringify(dashboardData, null, 2));
      console.log('📊 dashboardData 키들:', Object.keys(dashboardData));

      // 📊 날짜별 상태 집계를 저장할 객체
      const statusBadgeData: { [date: string]: ReservationCountData } = {};

      // 🔄 각 날짜별로 상태 정보 처리
      for (const date of dates) {
        try {
          console.log(`🔄 ${date} 상태 정보 조회 중...`);

          // 🎯 주 API 호출: 해당 날짜의 상세 스케줄 정보 가져오기
          const schedules = await getReservedSchedule(activityId, date);

          console.log(`📊 ${date} API 응답:`, JSON.stringify(schedules, null, 2));

          // 📈 날짜별 상태 카운트 초기화
          const dateCounts = { pending: 0, confirmed: 0, declined: 0, completed: 0 };

          // 🔄 FALLBACK 로직 1: getReservedSchedule이 빈 배열이면 dashboardData 사용
          if (schedules.length === 0) {
            console.log(
              `🔄 ${date} getReservedSchedule 빈 응답 → apiReservationData fallback 사용`,
            );

            // 📋 fallback 데이터에서 해당 날짜 정보 추출
            const fallbackData = dashboardData[date];
            if (fallbackData && fallbackData.length > 0) {
              console.log(`📋 ${date} fallback 데이터:`, JSON.stringify(fallbackData, null, 2));

              // 🔍 fallback 데이터에서 상태 정보 추출 (중첩된 구조 처리)
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
                      dateCounts.completed += counts.completed || 0; // fallback에서 completed 필드도 처리
                    }
                  });
                }
              });
            } else {
              console.log(`⚠️ ${date} fallback 데이터도 없음`);
            }
          } else {
            // ✅ 정상 응답인 경우: API 응답에서 상태 집계
            (schedules as ScheduleFromApi[]).forEach((schedule: ScheduleFromApi) => {
              if (schedule.count) {
                dateCounts.pending += schedule.count.pending || 0;
                dateCounts.confirmed += schedule.count.confirmed || 0;
                dateCounts.declined += schedule.count.declined || 0;
                // completed는 API에 없을 수 있으므로 기본값 0
              }
            });
          }

          console.log(`🔢 ${date} API 집계 후:`, JSON.stringify(dateCounts, null, 2));

          // 🕐 시간 기반 상태 변환 로직: 승인된 예약이 시간 지났으면 완료로 변환
          const now = new Date();

          // 🔄 시간 체크를 위한 데이터 소스 선택 (API 응답 우선, 없으면 fallback)
          const schedulesToCheck: (ScheduleFromApi | ScheduleData)[] =
            schedules.length > 0 ? (schedules as ScheduleFromApi[]) : dashboardData[date] || [];

          schedulesToCheck.forEach((schedule: ScheduleFromApi | ScheduleData) => {
            // 타입 가드: API 응답인지 fallback 데이터인지 확인
            const isApiSchedule = 'count' in schedule;

            // 📊 confirmed 예약이 있는지 확인 (API 응답과 fallback 구조가 다를 수 있음)
            const hasConfirmed = isApiSchedule
              ? (schedule as ScheduleFromApi).count &&
                (schedule as ScheduleFromApi).count!.confirmed > 0 // API 응답 구조
              : dateCounts.confirmed > 0; // fallback 구조

            if (hasConfirmed) {
              // ⏰ 예약 종료 시간 계산
              const endTime = schedule.endTime || '23:59'; // fallback의 경우 endTime이 없을 수 있음
              const scheduleEndDateTime = new Date(`${date} ${endTime}`);

              console.log(
                `⏰ ${date} 시간 체크: 현재=${now.toLocaleString()}, 종료=${scheduleEndDateTime.toLocaleString()}`,
              );

              // 🔄 현재 시간이 예약 종료 시간을 지났으면 완료 처리
              if (now > scheduleEndDateTime) {
                const confirmedCount = isApiSchedule
                  ? (schedule as ScheduleFromApi).count?.confirmed || 0
                  : dateCounts.confirmed;

                console.log(
                  `⏰ ${date} ${schedule.startTime || '시간미정'}-${endTime}: 시간 경과로 승인 ${confirmedCount}개 → 완료로 변환`,
                );

                // 📈 confirmed에서 completed로 상태 이동
                dateCounts.confirmed -= confirmedCount;
                dateCounts.completed += confirmedCount;
              } else {
                console.log(
                  `🕐 ${date} ${schedule.startTime || '시간미정'}-${endTime}: 아직 진행 중`,
                );
              }
            }
          });

          statusBadgeData[date] = dateCounts;
          console.log(`✅ ${date} 최종 상태:`, JSON.stringify(dateCounts, null, 2));
        } catch (err) {
          console.warn(`Failed to load status for ${date}:`, err);
        }
      }

      // 🌐 전역 변수에 저장 (기존 방식과 호환성 유지)
      // 캘린더 컴포넌트에서 이 데이터를 참조하여 뱃지 표시
      window.statusBadgeData = statusBadgeData;

      // 🔄 캘린더 리렌더링 트리거
      if (Object.keys(statusBadgeData).length > 0) {
        setApiReservationData((prev) => ({ ...prev }));
      }
    } catch (err) {
      console.error('Failed to load status badges:', err);
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
