// 📊 Dashboard(대시보드) 관련 타입 정의

import { ReservationCounts } from './reservation';
import { ScheduleData } from './schedule';

// 대시보드 아이템 타입 (API 응답)
export interface DashboardItem {
  date: string;
  reservations: ReservationCounts;
}

// 대시보드 데이터 타입 (날짜별로 스케줄들을 그룹화)
export interface DashboardData {
  [date: string]: ScheduleData[]; // "2024-01-15": [스케줄1, 스케줄2, ...]
}
