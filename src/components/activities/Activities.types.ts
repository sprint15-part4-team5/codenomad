export interface ActivityDetail {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  price: number;
  address: string;
  bannerImageUrl: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  subImages: SubImage[];
  schedules: Schedule[];
}

export interface SubImage {
  id: number;
  imageUrl: string;
}

export interface Schedule {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface ReviewUser {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export interface Review {
  id: number;
  user: ReviewUser;
  activityId: number;
  rating: number;
  content: string;
  createdAt: string; // ISO date string
  updatedAt: string;
}

export interface ReviewResponse {
  averageRating: number;
  totalCount: number;
  reviews: Review[];
}

// === 예약 관련 타입들 ===

// 예약 상태
export interface ReservationState {
  scheduleId: number | null;
  headCount: number;
}

// 예약 확정 데이터
export interface ConfirmedReservation {
  scheduleId: number;
  headCount: number;
}

// 예약 컨트롤 Props (통일된 naming)
export interface ReservationControlProps {
  scheduleId: number | null;
  onChangeSchedule: (id: number | null) => void;
  headCount: number;
  onChangeHeadCount: (count: number) => void;
}

// 예약에 필요한 최소 활동 데이터
export interface ReservationActivityData {
  schedules: Schedule[];
  price: number;
  title: string;
}

// DesktopCard Props
export interface DesktopCardProps extends ReservationControlProps {
  activityData: ReservationActivityData;
  onReservationSubmit: (data: ConfirmedReservation) => void;
}

// ModalTrigger Props
export interface ModalTriggerProps extends ReservationControlProps {
  activityData: ReservationActivityData;
  onReservationReset?: () => void;
  onReservationSubmit: (data: ConfirmedReservation) => void;
  isOwner?: boolean;
}

// 모달 공통 Props
export interface BaseModalProps extends ReservationControlProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  schedules: Schedule[];
  price: number;
}
