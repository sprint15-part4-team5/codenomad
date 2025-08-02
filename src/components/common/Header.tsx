'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Dropdown from './Dropdown/Dropdown';
import NotiBell from './Notification/NotiBell';
import { useAuthStore } from '@/store/useAuthStore';

const Header = () => {
  const router = useRouter();
  const { user, clearAuthStore } = useAuthStore();

  const handleLogout = () => {
    clearAuthStore();
    useAuthStore.persist.clearStorage();
    router.push('/');
  };

  return (
    <header className='fixed top-0 left-0 z-20 h-48 w-full border-b border-gray-100 bg-white md:h-80'>
      <div className='mx-auto flex h-full max-w-screen-xl items-center justify-between px-6'>
        {/* 로고 */}
        <Link href='/home' className='flex items-center gap-2 p-6'>
          <Image
            src='/icons/wazyLogoVertical.svg'
            alt='wazy 로고'
            width={0}
            height={0}
            sizes='100vw'
            className='h-36 w-auto md:h-40'
          />
        </Link>

        {/* 로그인 여부에 따라 분기 */}
        {user ? (
          <div className='relative flex items-center gap-4'>
            {/* 알림 아이콘 */}
            <NotiBell />
            {/* 구분선 */}
            <div className='h-14 w-px bg-gray-200' />

            {/* 프로필 + 닉네임 + 드롭다운 */}
            <Dropdown>
              <Dropdown.Trigger>
                <div className='mt-8 flex cursor-pointer items-center gap-2'>
                  <Image
                    src={user.profileImageUrl || '/icons/default_profilewazy.svg'}
                    alt='프로필'
                    width={30}
                    height={30}
                    className='aspect-square rounded-full object-cover'
                  />
                  <span className='text-14-m max-w-[6.25rem] truncate leading-none whitespace-nowrap text-gray-950'>
                    {user.nickname}
                  </span>
                </div>
              </Dropdown.Trigger>

              <Dropdown.Content className='top-40 right-0'>
                <Dropdown.Item>
                  <Link
                    href='/profile'
                    className='block w-full px-4 py-2 text-center text-sm text-gray-800'
                  >
                    마이페이지
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item onClick={handleLogout}>
                  <span className='block w-full px-4 py-2 text-center text-sm text-gray-800'>
                    로그아웃
                  </span>
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown>
          </div>
        ) : (
          <nav className='flex gap-10 text-sm whitespace-nowrap text-gray-900 no-underline'>
            <Link href='/login'>로그인</Link>
            <Link href='/signup'>회원가입</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
