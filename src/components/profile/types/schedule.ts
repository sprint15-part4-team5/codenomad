// 📅 Schedule(스케줄) 관련 타입 정의

import { ReservationCounts, ReservationData } from './reservation';
import { DashboardItem } from './dashboard';

// API에서 받는 스케줄 타입
export interface ScheduleFromApi {
  id: number | string;
  scheduleId?: number | string;
  startTime: string;
  endTime: string;
  count?: ReservationCounts;
}

// 스케줄 데이터 타입 (특정 시간대의 모든 예약 포함)
export interface ScheduleData {
  id: number | string;
  scheduleId?: number | string;
  timeSlot: string; // 시간대 표시용 (예: "14:00 - 15:00")
  startTime: string;
  endTime: string;
  reservations: (DashboardItem | ReservationData)[]; // 대시보드 아이템 또는 예약 데이터
  headCount?: number;
}
