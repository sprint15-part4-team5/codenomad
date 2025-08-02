// ================== 체험 상세 타입 ==================
export interface ExperienceDetail {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  address: string;
  bannerImageUrl: string;
  subImages: Array<{
    id: number;
    imageUrl: string;
  }>;
  schedules: Array<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  }>;
  userId: number | string;
}

// ================== 체험 등록 ==================
export interface CreateExperienceRequest {
  title: string;
  category: string;
  description: string;
  price: number;
  address: string;
  schedules: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  bannerImageUrl: string;
  subImageUrls: string[];
}

// ================== 체험 등록 응답 ==================
export interface CreateExperienceResponse {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  price: number;
  address: string;
  bannerImageUrl: string;
  subImageUrls: string[];
  schedules: Array<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  }>;
  reviewCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

// ================== 체험 수정 ==================
export interface UpdateExperienceRequest {
  title: string;
  category: string;
  description: string;
  price: number;
  address: string;
  bannerImageUrl: string;
  subImageIdsToRemove: number[];
  subImageUrlsToAdd: string[];
  scheduleIdsToRemove: number[];
  schedulesToAdd: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
}
