import { z } from 'zod';

export const experiencesSchema = z.object({
  title: z.string().min(1, '제목을 입력해 주세요.').max(30, '30자 이내로 입력해 주세요.'),
  category: z.string().min(1, '카테고리를 선택해 주세요.'),
  price: z.string().min(1, '가격을 입력해 주세요.').regex(/^\d+$/, '숫자만 입력해 주세요.'),
  address: z.string().min(1, '주소를 입력해 주세요.'),
  description: z.string().min(1, '설명을 입력해 주세요.').max(1000, '1000자 이내로 입력해 주세요.'),
  // reserveTimes, banner, introImages 등은 필요에 따라 추가
});

export type FormValues = z.infer<typeof experiencesSchema>;
