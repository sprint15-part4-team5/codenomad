'use client';

import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Input from '@/components/common/Input';
import { ProfileMobileContext } from '../layout';
import { getUserProfile, updateUserProfile } from '@/lib/api/profile';
import { MobilePageHeader, LoadingSpinner } from '@/components/profile/common/components';
import { useAuthStore } from '@/store/useAuthStore';
// 	서버/API에서 받은 프로필 데이터 검증 및 타입 변환
import { ProfileSchema } from '@/lib/schema/profileSchema';
// 사용자 정보 수정 폼 입력값 유효성 검증
import { userInfoSchema, type UserInfoFormValues } from '@/lib/schema/authSchema';

const InformationPage = () => {
  const { user, setUser, setUserProfile } = useAuthStore();

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState('');

  const mobileContext = useContext(ProfileMobileContext);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
    mode: 'onBlur',
    defaultValues: {
      nickname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        setError('');

        const rawProfile = await getUserProfile();

        // Zod parse로 타입 안전하게 변환 및 검증
        const profile = ProfileSchema.parse(rawProfile);

        setValue('email', profile.email);
        setValue('nickname', profile.nickname);

        if (user) {
          setUserProfile({
            email: profile.email,
            nickname: profile.nickname,
          });
        } else {
          setUser({
            ...profile,
            profileImageUrl: profile.profileImageUrl || null,
            createdAt: profile.createdAt || '',
            updatedAt: profile.updatedAt || '',
          });
        }
      } catch {
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user, setUser, setUserProfile, setValue]);

  const watchedPassword = watch('password');

  const onSubmit = async (data: UserInfoFormValues) => {
    try {
      setError('');

      const updateData: {
        nickname: string;
        email: string;
        newPassword?: string;
      } = {
        nickname: data.nickname,
        email: data.email,
      };

      if (data.password && data.password.length > 0) {
        updateData.newPassword = data.password;
      }

      await updateUserProfile(updateData);

      setUserProfile({
        email: updateData.email,
        nickname: updateData.nickname,
      });

      alert('회원정보가 성공적으로 수정되었습니다!');

      setValue('password', '');
      setValue('confirmPassword', '');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as {
          response?: { data?: { message?: string }; status?: number };
        };
        if (errorResponse.response?.data?.message) {
          setError(errorResponse.response.data.message);
        } else if (errorResponse.response?.status === 409) {
          setError('중복된 이메일입니다.');
        } else {
          setError('회원정보 수정에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        setError('회원정보 수정에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  if (isLoadingProfile) {
    return <LoadingSpinner message='사용자 정보를 불러오는 중...' useLogo={true} />;
  }

  if (isSubmitting) {
    return <LoadingSpinner message='정보를 저장하는 중...' useLogo={true} />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='rounded-16 mx-auto w-full max-w-376 space-y-24 bg-white p-24 md:max-w-640 md:p-32'
    >
      <MobilePageHeader title='내 정보' description='닉네임과 비밀번호를 수정하실 수 있습니다.' />

      {error && <div className='rounded-lg bg-red-50 p-3 text-sm text-red-500'>{error}</div>}

      <Input
        label='닉네임'
        {...register('nickname')}
        placeholder='닉네임을 입력해 주세요'
        error={errors.nickname?.message}
        autoComplete='username'
      />
      <Input
        label='이메일'
        {...register('email')}
        placeholder='이메일을 입력해 주세요'
        error={errors.email?.message}
        type='email'
        autoComplete='email'
        readOnly
      />
      <Input
        label='새 비밀번호 (변경 시에만 입력)'
        {...register('password')}
        placeholder='8자 이상 입력해 주세요'
        error={errors.password?.message}
        type='password'
        autoComplete='new-password'
      />
      <Input
        label='새 비밀번호 확인'
        {...register('confirmPassword')}
        placeholder='비밀번호를 한번 더 입력해 주세요'
        error={errors.confirmPassword?.message}
        type='password'
        autoComplete='new-password'
        disabled={!watchedPassword}
      />

      {/* 모바일 저장/취소 버튼 */}
      <div className='flex justify-center gap-3 md:hidden'>
        <button
          type='button'
          className='text-16-m h-41 flex-1 rounded-[12px] border border-gray-300 bg-white px-10 py-3 text-gray-700'
          onClick={mobileContext?.onCancel}
          disabled={isSubmitting}
        >
          취소하기
        </button>
        <button
          type='submit'
          className='text-16-m hover:shadow-brand-blue/60 bg-primary-500 h-41 flex-1 cursor-pointer rounded-xl px-10 py-3 text-white transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50'
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
      </div>

      {/* PC 저장 버튼 */}
      <div className='hidden justify-center md:flex'>
        <button
          type='submit'
          className='text-16-m hover:shadow-brand-blue/60 bg-primary-500 h-41 w-120 cursor-pointer rounded-xl py-3 text-white transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50'
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </form>
  );
};

export default InformationPage;
