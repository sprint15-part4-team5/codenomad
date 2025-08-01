'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import Input from '@/components/common/Input';
import { ProfileMobileContext } from '../layout';
import { getUserProfile, updateUserProfile } from '@/lib/api/profile';
// 🆕 공통 컴포넌트 import (파일명 변경: index.ts → components.ts)
import { MobilePageHeader, LoadingSpinner } from '@/components/profile/common/components';
import { useAuthStore } from '@/store/useAuthStore';

const InformationPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const { setUserNickname } = useAuthStore();
  // 🔗 모바일 Context 연결: 부모 레이아웃의 onCancel 함수 가져오기
  // 이 함수를 호출하면 모바일에서 메뉴 화면으로 돌아감
  const mobileContext = useContext(ProfileMobileContext);

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profile = await getUserProfile();
        setEmail(profile.email);
        setNickname(profile.nickname);
      } catch {
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // 이메일 유효성
  const validateEmail = (value: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailError(isValid ? '' : '잘못된 이메일입니다.');
  };

  // 닉네임 유효성
  const validateNickname = (value: string) => {
    setNicknameError(value.length <= 10 ? '' : '10자 이하로 작성해주세요.');
  };

  // 비밀번호 유효성
  const validatePassword = (value: string) => {
    setPasswordError(value.length >= 8 ? '' : '8자 이상 입력해주세요.');
  };

  const validateConfirm = useCallback(
    (value: string) => {
      setConfirmError(value === password ? '' : '비밀번호가 일치하지 않습니다.');
    },
    [password],
  );

  // 비밀번호 변경하면 다시 확인되게
  useEffect(() => {
    if (confirmPassword) {
      validateConfirm(confirmPassword);
    }
  }, [password, confirmPassword, validateConfirm]);

  // 폼 유효성 상태
  const isFormValid =
    nickname &&
    email &&
    !nicknameError &&
    !emailError &&
    (!password || (password && confirmPassword && !passwordError && !confirmError));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const updateData: {
        nickname: string;
        email: string;
        newPassword?: string;
      } = {
        nickname,
        email,
      };

      // 비밀번호가 입력된 경우에만 포함
      if (password) {
        updateData.newPassword = password;
      }

      await updateUserProfile(updateData);
      setUserNickname(nickname);
      alert('회원정보가 성공적으로 수정되었습니다.');

      // 비밀번호 필드 초기화
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as {
          response?: { data?: { message?: string }; status?: number };
        };
        if (errorResponse.response?.data?.message) {
          setError(errorResponse.response.data.message);
        } else if (errorResponse.response?.status === 409) {
          setEmailError('중복된 이메일입니다.');
        } else {
          setError('회원정보 수정에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        setError('회원정보 수정에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ⏳ 로딩 상태: 공통 LoadingSpinner 컴포넌트 사용
  if (isLoadingProfile) {
    return <LoadingSpinner message='사용자 정보를 불러오는 중...' useLogo={true} />;
  }

  // ⏳ 폼 제출 중 로딩 상태
  if (isLoading) {
    return <LoadingSpinner message='정보를 저장하는 중...' useLogo={true} />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='rounded-16 mx-auto w-full max-w-376 space-y-24 bg-white p-24 md:max-w-640 md:p-32'
    >
      {/* 🆕 공통 MobilePageHeader 컴포넌트 사용 */}
      <MobilePageHeader title='내 정보' description='닉네임과 비밀번호를 수정하실 수 있습니다.' />

      {/* 에러 메시지 */}
      {error && <div className='rounded-lg bg-red-50 p-3 text-sm text-red-500'>{error}</div>}

      <Input
        label='닉네임'
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        onBlur={(e) => validateNickname(e.target.value)}
        placeholder='닉네임을 입력해 주세요'
        error={nicknameError}
        autoComplete='username'
      />

      <Input
        label='이메일'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={(e) => validateEmail(e.target.value)}
        placeholder='이메일을 입력해 주세요'
        error={emailError}
        type='email'
        autoComplete='email'
        readOnly
      />

      <Input
        label='새 비밀번호 (변경 시에만 입력)'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={(e) => validatePassword(e.target.value)}
        placeholder='8자 이상 입력해 주세요'
        error={passwordError}
        type='password'
        autoComplete='new-password'
      />

      <Input
        label='새 비밀번호 확인'
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onBlur={(e) => validateConfirm(e.target.value)}
        placeholder='비밀번호를 한번 더 입력해 주세요'
        error={confirmError}
        type='password'
        autoComplete='new-password'
        disabled={!password}
      />

      {/* 저장/취소 버튼 (모바일에서만 보임) */}
      <div className='flex justify-center gap-3 md:hidden'>
        <button
          type='button'
          className='text-16-m h-41 flex-1 rounded-[12px] border border-gray-300 bg-white px-10 py-3 text-gray-700'
          onClick={mobileContext?.onCancel}
          disabled={isLoading}
        >
          취소하기
        </button>
        <button
          type='submit'
          className='text-16-m hover:shadow-brand-blue/60 bg-primary-500 rounded-12 h-41 flex-1 cursor-pointer px-10 py-3 text-white transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50'
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? '저장 중...' : '저장하기'}
        </button>
      </div>

      {/* 저장 버튼 (PC에서만 보임) */}
      <div className='hidden justify-center md:flex'>
        <button
          type='submit'
          className='text-16-m hover:shadow-brand-blue/60 bg-primary-500 h-41 w-120 cursor-pointer rounded-xl py-3 text-white transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50'
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </form>
  );
};

export default InformationPage;
