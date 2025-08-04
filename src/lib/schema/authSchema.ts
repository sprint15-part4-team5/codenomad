import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, '이메일을 입력해주세요.')
    .regex(emailRegex, '유효한 이메일 형식이 아닙니다.'),
  password: z.string().trim().min(1, '비밀번호를 입력해주세요.'),
});

export const signupSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .min(1, '닉네임을 입력해주세요.')
      .max(10, '닉네임은 10자 이내여야 합니다.'),
    email: z
      .string()
      .trim()
      .min(1, '이메일을 입력해주세요.')
      .regex(emailRegex, '유효한 이메일 형식이 아닙니다.'),
    password: z.string().trim().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    confirmPassword: z.string().trim().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export const userInfoSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .min(1, '닉네임을 입력해주세요.')
      .max(10, '10자 이하로 작성해주세요.'),
    email: z
      .string()
      .trim()
      .min(1, '이메일을 입력해주세요.')
      .regex(emailRegex, '잘못된 이메일입니다.'),
    password: z.string().trim().optional(),
    confirmPassword: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.trim().length > 0) {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: '8자 이상 입력해주세요.',
      path: ['password'],
    },
  )
  .refine(
    (data) => {
      if (data.password && data.password.trim().length > 0) {
        return data.confirmPassword && data.confirmPassword.trim().length > 0;
      }
      return true;
    },
    {
      message: '비밀번호 확인을 입력해주세요.',
      path: ['confirmPassword'],
    },
  )
  .refine(
    (data) => {
      if (data.password && data.password.trim().length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: '비밀번호가 일치하지 않습니다.',
      path: ['confirmPassword'],
    },
  );

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type UserInfoFormValues = z.infer<typeof userInfoSchema>;
