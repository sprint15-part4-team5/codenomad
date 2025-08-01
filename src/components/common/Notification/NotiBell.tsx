//알림 벨 아이콘 컴포넌트
'use client';

import instance from '@/lib/api/axios';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import NotiList from './NotiList';
import clsx from 'clsx';
import showToastError from '@/lib/showToastError';

const NotiBell = () => {
  const [open, setOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await instance.get('/my-notifications');
        if (res.data.totalCount > 0) {
          setHasNewNotification(true);
        }
      } catch (err) {
        showToastError(err);
      }
    };

    checkNotifications();
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  return (
    <div ref={bellRef} className='relative'>
      {/* 알림 아이콘 */}
      <Image
        src={hasNewNotification ? '/icons/icon_bell_on.svg' : '/icons/icon_bell_off.svg'}
        alt='알림'
        width={24}
        height={24}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className={clsx(
          'cursor-pointer transition-opacity duration-200 hover:opacity-80',
          open && 'text-primary-500 brightness-0 saturate-100 filter',
        )}
      />

      {/* 배경 오버레이 */}
      {open && <div className='fixed inset-0 z-40 bg-black/10' onClick={() => setOpen(false)} />}

      {/* 알림 목록 드롭다운 */}
      {open && (
        <div className='fixed top-[3.75rem] left-1/2 z-40 -translate-x-1/2 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-12 sm:translate-x-0'>
          <NotiList setHasNewNotification={setHasNewNotification} />
        </div>
      )}
    </div>
  );
};

export default NotiBell;
