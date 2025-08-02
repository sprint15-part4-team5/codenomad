// 📋 Reservation(예약) 관련 타입 정의

// 예약 상태 타입
export type ReservationStatus = 'pending' | 'confirmed' | 'declined' | 'completed';

// 예약 데이터 타입
export interface ReservationData {
  id: number;
  status: ReservationStatus;
  headCount: number;
  nickname: string;
  scheduleId: number | string;
  timeSlot: string;
  date: string;
  startTime: string;
  endTime: string;
}

// 예약 카운트 데이터 타입
export interface ReservationCounts {
  pending: number;
  confirmed: number;
  declined: number;
  completed: number;
}
