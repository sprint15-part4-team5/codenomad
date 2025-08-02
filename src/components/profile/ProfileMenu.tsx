'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, ChangeEvent } from 'react';
import { uploadProfileImage, updateUserProfile } from '@/lib/api/profile';
import { useAuthStore } from '@/store/useAuthStore';

const menuItems = [
  { icon: '/icons/icon_user.svg', label: '내 정보', href: '/profile/info' },
  { icon: '/icons/icon_list.svg', label: '예약내역', href: '/profile/reservations' },
  { icon: '/icons/icon_setting.svg', label: '내 체험 관리', href: '/profile/myExperiences' },
  { icon: '/icons/icon_calendar.svg', label: '예약 현황', href: '/profile/myActivitiesStatus' },
];

interface ProfileMenuProps {
  onMenuClick?: (path: string) => void;
}

export default function ProfileMenu({ onMenuClick }: ProfileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUserProfileImage, user } = useAuthStore();

  // 이미지 업로드 핸들러
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const updated = await uploadProfileImage(file);
      const updatedUrl = updated.profileImageUrl
        ? updated.profileImageUrl + '?t=' + Date.now()
        : '/imgs/profile_default.png';
      setUserProfileImage(updatedUrl);
      updateUserProfile({ profileImageUrl: updatedUrl });
      alert('프로필 이미지가 변경되었습니다!');
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className='shadow-custom-5 mx-auto mt-20 flex h-453 w-327 flex-col items-center rounded-2xl bg-white px-6 py-8 md:w-178 md:px-4 md:py-6 lg:w-290 lg:px-8 lg:py-10'>
      {/* 프로필 이미지 */}
      <div className='relative mb-8'>
        <div className='mt-40 mb-40 flex h-120 w-120 items-center justify-center overflow-hidden rounded-full bg-blue-100'>
          <Image
            src={user?.profileImageUrl || '/imgs/profile_default.png'}
            alt='프로필'
            width={120}
            height={120}
            style={{ objectFit: 'cover' }}
            key={user?.profileImageUrl}
          />
        </div>
        {/* 연필 아이콘 */}
        <button
          className='shadow-custom-5 absolute right-2 bottom-2 mb-30 rounded-full border border-gray-200 bg-gray-300 p-1'
          aria-label='프로필 수정'
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Image
            src='/icons/icon_edit.svg'
            alt='수정'
            width={30}
            height={30}
            style={{
              filter: 'invert(1) brightness(2)',
            }}
          />
        </button>
        {/* 실제 파일 input은 숨김 */}
        <input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageChange}
          disabled={isUploading}
        />
        {/* 업로드 중 오버레이 */}
        {isUploading && (
          <div className='absolute inset-0 flex items-center justify-center rounded-full bg-white/60'>
            <span className='text-primary-500 font-bold'>업로드 중...</span>
          </div>
        )}
      </div>
      {/* 메뉴 리스트 */}
      <ul className='w-full space-y-2'>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          // 🔄 모바일/데스크톱 분기 처리
          if (onMenuClick) {
            // 📱 모바일 모드: onMenuClick prop이 전달된 경우
            // 메뉴 클릭 시 → 1) onMenuClick() 실행으로 showContent=true → 2) 라우팅
            return (
              <li key={item.label} className='w-full'>
                <button
                  type='button'
                  onClick={() => {
                    onMenuClick(item.href); // 🎯 layout.tsx의 setShowContent(true) 실행
                    router.push(item.href); // 🚀 해당 서브페이지로 라우팅
                  }}
                  className={`flex h-54 w-full cursor-pointer items-center gap-3 rounded-xl px-3 transition-colors md:px-30 ${isActive ? 'bg-primary-100 text-primary-500' : 'text-gray-600'} hover:bg-primary-100 hover:text-primary-500`}
                  style={{ boxSizing: 'border-box' }}
                >
                  {/* 내 정보 메뉴에 Vector.png 아이콘 제거 (info/page.tsx에서만 보임) */}
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={24}
                    height={24}
                    style={{
                      filter: isActive
                        ? 'invert(39%) sepia(99%) saturate(577%) hue-rotate(71deg) brightness(99%) contrast(91%)'
                        : undefined,
                    }}
                  />
                  <span className='text-16-m'>{item.label}</span>
                </button>
              </li>
            );
          }

          // 💻 데스크톱 모드: onMenuClick prop이 없는 경우
          // 일반적인 Link 컴포넌트로 라우팅만 처리 (화면 전환 없음)
          return (
            <li key={item.label} className='w-full'>
              <Link
                href={item.href}
                className={`flex h-54 w-full cursor-pointer items-center gap-3 rounded-xl px-3 transition-colors md:px-30 ${isActive ? 'bg-primary-100 text-primary-500' : 'text-gray-600'} hover:bg-primary-100 hover:text-primary-500`}
                style={{ boxSizing: 'border-box' }}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  style={{
                    filter: isActive
                      ? 'invert(39%) sepia(99%) saturate(577%) hue-rotate(71deg) brightness(99%) contrast(91%)'
                      : undefined,
                  }}
                />
                <span className='text-16-m'>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
