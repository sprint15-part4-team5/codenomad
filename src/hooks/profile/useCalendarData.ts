import { useMemo } from 'react';
import type {
  CalendarReservationData,
  ReservationCounts,
  DashboardItem,
  DashboardData,
} from '@/components/profile/types';

// 🔧 공통 함수: 예약 카운트를 캘린더 뱃지로 변환
const createReservationBadges = (counts: ReservationCounts): CalendarReservationData[] => {
  const badges: CalendarReservationData[] = [];

  // 📈 각 상태별로 뱃지 생성 (개수가 0보다 클 때만)
  if (counts.pending > 0) {
    badges.push({ status: '예약', count: counts.pending, nickname: 'User' });
  }
  if (counts.confirmed > 0) {
    badges.push({ status: '승인', count: counts.confirmed, nickname: 'User' });
  }
  if (counts.declined > 0) {
    badges.push({ status: '거절', count: counts.declined, nickname: 'User' });
  }
  if (counts.completed > 0) {
    badges.push({ status: '완료', count: counts.completed, nickname: 'User' });
  }

  return badges;
};

// 🎣 캘린더 데이터 변환 커스텀 훅
// 역할: 복잡한 예약 데이터를 캘린더가 이해할 수 있는 형태로 변환
export const useCalendarData = (apiReservationData: DashboardData) => {
  // 🎨 메모이제이션으로 불필요한 재계산 방지
  const calendarData = useMemo(() => {
    // 📊 최종 결과: 날짜별 뱃지 배열을 담는 객체
    const convertedData: Record<string, CalendarReservationData[]> = {};

    // ✨ 우선순위 1: statusBadgeData 사용 (getReservedSchedule 기반의 정확한 데이터)
    // 이 데이터는 loadStatusBadgesWithReservedSchedule에서 생성됨
    // 🔒 SSR 안전성: window 객체 존재 여부 확인
    const statusBadgeData = typeof window !== 'undefined' ? window.statusBadgeData : undefined;

    if (statusBadgeData) {
      // 🎯 정확한 상태 데이터를 기반으로 캘린더 뱃지 생성
      Object.entries(statusBadgeData).forEach(([date, counts]) => {
        convertedData[date] = createReservationBadges(counts);
      });
    } else {
      // 🔄 FALLBACK: 기존 방식 (statusBadgeData가 아직 로드되지 않은 경우)
      // apiReservationData (대시보드 API 응답)를 사용하여 뱃지 생성
      Object.entries(apiReservationData).forEach(([date, schedules]) => {
        const aggregatedCounts: ReservationCounts = {
          pending: 0,
          confirmed: 0,
          declined: 0,
          completed: 0,
        };

        // 📋 스케줄별로 예약 정보 추출 및 집계 (중첩된 구조 처리)
        schedules.forEach((schedule) => {
          if (schedule.reservations && Array.isArray(schedule.reservations)) {
            schedule.reservations.forEach((reservationGroup) => {
              // 타입 가드를 사용하여 DashboardItem인지 확인
              if (
                reservationGroup &&
                'reservations' in reservationGroup &&
                typeof reservationGroup.reservations === 'object'
              ) {
                const dashboardItem = reservationGroup as DashboardItem;
                const counts = dashboardItem.reservations;

                // 📊 카운트 집계
                aggregatedCounts.pending += counts.pending || 0;
                aggregatedCounts.confirmed += counts.confirmed || 0;
                aggregatedCounts.declined += counts.declined || 0;
                aggregatedCounts.completed += counts.completed || 0;
              }
            });
          }
        });

        // 🎨 공통 함수를 사용하여 뱃지 생성
        convertedData[date] = createReservationBadges(aggregatedCounts);
      });
    }

    // 🎨 최종 결과 반환: 캘린더가 이해할 수 있는 형태의 데이터
    return convertedData;
  }, [apiReservationData]); // apiReservationData가 변경될 때만 재계산

  return calendarData;
};
