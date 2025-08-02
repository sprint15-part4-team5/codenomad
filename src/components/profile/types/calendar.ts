// 📅 Calendar(캘린더) 관련 타입 정의

// 캘린더용 예약 데이터 타입 (캘린더 컴포넌트와 일치)
export interface CalendarReservationData {
  status: string; // 한글 상태명 (예약, 승인, 거절, 완료)
  count: number; // 해당 상태의 예약 개수
  nickname: string; // 표시용 (실제로는 사용하지 않음)
}

// Window 객체 확장 (statusBadgeData 타입 정의)
declare global {
  interface Window {
    statusBadgeData?: Record<string, import('./reservation').ReservationCounts>;
  }
}
