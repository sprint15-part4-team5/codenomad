'use client';

import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/common/Input';
import { ProfileMobileContext } from '../layout';
import { getUserProfile, updateUserProfile } from '@/lib/api/profile';
// 🆕 공통 컴포넌트 import (파일명 변경: index.ts → components.ts)
import { MobilePageHeader, LoadingSpinner } from '@/components/profile/common/components';
import { useAuthStore } from '@/store/useAuthStore';
import { userInfoSchema, type UserInfoFormValues } from '@/lib/schema/authSchema';
import { toast } from 'sonner';

const InformationPage = () => {
  // 🎯 zustand에서 사용자 정보 및 업데이트 함수 가져오기
  const { user, setUser, setUserProfile } = useAuthStore();

  // ⏳ 로딩 상태 (로컬)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  // 🔗 모바일 Context 연결: 부모 레이아웃의 onCancel 함수 가져오기
  // 이 함수를 호출하면 모바일에서 메뉴 화면으로 돌아감
  const mobileContext = useContext(ProfileMobileContext);

  // 🎯 react-hook-form + zod를 사용한 폼 관리
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

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);

        // 🎯 zustand에 이미 사용자 정보가 있다면 그것을 사용
        if (user?.email && user?.nickname) {
          setValue('email', user.email);
          setValue('nickname', user.nickname);
          setIsLoadingProfile(false);
          return;
        }

        // 📡 API에서 사용자 정보 가져오기
        const profile = await getUserProfile();

        // 🔄 폼 필드 업데이트
        setValue('email', profile.email);
        setValue('nickname', profile.nickname);

        // 🎯 zustand 전역 상태도 업데이트
        if (user) {
          setUserProfile({
            email: profile.email,
            nickname: profile.nickname,
          });
        } else {
          // user가 없다면 전체 user 객체 생성
          setUser({
            ...profile,
            id: typeof profile.id === 'string' ? parseInt(profile.id, 10) : profile.id || 0,
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

  // 🎯 비밀번호 필드 감시
  const watchedPassword = watch('password');

  // 🎯 react-hook-form + zod를 사용한 폼 제출 처리
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

      // 비밀번호가 입력된 경우에만 포함
      if (data.password && data.password.length > 0) {
        updateData.newPassword = data.password;
      }

      await updateUserProfile(updateData);

      // 🎯 API 업데이트 성공 시 zustand 전역 상태도 업데이트
      setUserProfile({
        email: updateData.email,
        nickname: updateData.nickname,
      });

      toast.success('회원정보가 성공적으로 수정되었습니다.');

      // 비밀번호 필드 초기화
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

  // ⏳ 로딩 상태: 공통 LoadingSpinner 컴포넌트 사용
  if (isLoadingProfile) {
    return <LoadingSpinner message='사용자 정보를 불러오는 중...' useLogo={true} />;
  }

  // ⏳ 폼 제출 중 로딩 상태
  if (isSubmitting) {
    return <LoadingSpinner message='정보를 저장하는 중...' useLogo={true} />;
  }

  return (
    <div className='mx-auto flex w-full flex-col justify-center p-24 lg:px-126'>
      <h1 className='text-18-b text-gray-950'>
        <MobilePageHeader title='내 정보' description='닉네임과 비밀번호를 수정하실 수 있습니다.' />
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='rounded-16 mx-auto w-full max-w-376 space-y-24 p-24 md:max-w-640 md:p-32'
      >
        {/* 에러 메시지 */}
        {error && <div className='rounded-lg bg-red-50 p-3 text-sm text-red-500'>{error}</div>}

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
          label='닉네임'
          {...register('nickname')}
          placeholder='닉네임을 입력해 주세요'
          error={errors.nickname?.message}
          autoComplete='username'
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

        {/* 저장/취소 버튼 (모바일에서만 보임) */}
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

        {/* 저장 버튼 (PC에서만 보임) */}
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
    </div>
  );
};

export default InformationPage;
