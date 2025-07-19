'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Dropdown from './Dropdown/Dropdown';
import clsx from 'clsx';

const Header = () => {
  const [user, setUser] = useState<{ nickname: string; profileImageUrl?: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isSearch = pathname.startsWith('/search');

  // 유저 정보 로드
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener('user-update', loadUser);
    return () => {
      window.removeEventListener('user-update', loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-update')); // 헤더 갱신을 위해 이벤트 발생
    router.push('/');
  };

  const hasNewNotification = false; // 추후 API 연동

  return (
    <header className={clsx('h-[48px] w-full md:h-[80px]', (isHome || isSearch) && 'bg-[#bbddff]')}>
      <div className='mx-auto flex h-full max-w-screen-xl items-center justify-between px-6'>
        {/* 로고 */}
        <Link href='/' className='flex items-center gap-2'>
          <Image
            src='/icons/logoVertical.svg'
            alt='GlobalNomad 로고'
            width={174}
            height={28}
            priority
          />
        </Link>

        {/* 로그인 여부에 따라 분기 */}
        {user ? (
          <div className='relative flex items-center gap-4'>
            {/* 알림 아이콘 */}
            <Image
              src={hasNewNotification ? '/icons/icon_bell_on.svg' : '/icons/icon_bell_off.svg'}
              alt='알림'
              width={24}
              height={24}
              className='cursor-pointer text-gray-600 transition-opacity duration-200 hover:opacity-80'
            />
            {/* 구분선 */}
            <div className='h-14 w-px bg-gray-200' />

            {/* 프로필 + 닉네임 + 드롭다운 */}
            <Dropdown>
              <Dropdown.Trigger>
                <div className='mt-8 flex cursor-pointer items-center gap-2'>
                  <Image
                    src={user.profileImageUrl || '/icons/default_profile30.svg'}
                    alt='프로필'
                    width={30}
                    height={30}
                    className='h-auto w-auto rounded-full object-cover'
                  />
                  <span className='text-14-m max-w-[100px] truncate leading-none whitespace-nowrap text-gray-950'>
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
