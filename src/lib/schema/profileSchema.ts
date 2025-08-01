// /lib/schema/profileSchema.ts
import { z } from 'zod';

// 프로필 데이터 스키마 정의
export const ProfileSchema = z.object({
  id: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() !== '') {
      const parsed = Number(val);
      if (!Number.isNaN(parsed) && Number.isInteger(parsed)) return parsed;
      return 0;
    }
    if (typeof val === 'number' && Number.isInteger(val)) {
      return val;
    }
    return 0;
  }, z.number().int()),
  email: z.string().email(),
  nickname: z.string(),
  profileImageUrl: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  // 필요시 추가 필드 작성
});
