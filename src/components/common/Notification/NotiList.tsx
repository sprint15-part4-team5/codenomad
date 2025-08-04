'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotiItem from './NotiItem';
import instance from '@/lib/api/axios';
import showToastError from '@/lib/showToastError';
import NotiNull from './NotiNull';

interface NotificationType {
  id: number;
  teamId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ApiResponse {
  cursorId: number | null;
  notifications: NotificationType[];
  totalCount: number;
}

interface NotiListProps {
  setHasNewNotification?: (val: boolean) => void;
}

const fetchNotifications = async (cursorId?: number): Promise<ApiResponse> => {
  const params = cursorId ? { cursorId, size: 10 } : { size: 10 };
  const res = await instance.get('/my-notifications', { params });
  return res.data;
};

const deleteNotification = async (notificationId: number) => {
  await instance.delete(`/my-notifications/${notificationId}`);
};

const NotiList = ({ setHasNewNotification }: NotiListProps) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [cursorId, setCursorId] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchedCursor = useRef<number | null>(null);

  const router = useRouter();

  const loadNotifications = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const data = await fetchNotifications(cursorId);
      if (data.cursorId === lastFetchedCursor.current) {
        setHasMore(false);
        return;
      }

      setNotifications((prev) => [...prev, ...data.notifications]);
      setTotalCount(data.totalCount);
      setCursorId(data.cursorId || undefined);
      lastFetchedCursor.current = data.cursorId;

      if (!data.cursorId) setHasMore(false);
    } catch (err) {
      showToastError(err);
    } finally {
      setIsLoading(false);
    }
  }, [cursorId, hasMore, isLoading]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadNotifications();
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => {
        const newList = prev.filter((item) => item.id !== id);
        if (newList.length === 0 && setHasNewNotification) {
          setHasNewNotification(false);
        }
        return newList;
      });
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      showToastError(err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <div
      className='max-h-[22.5rem] w-[92vw] max-w-[20rem] overflow-y-auto rounded-[0.75rem] bg-white shadow-lg transition-all'
      onScroll={handleScroll}
    >
      <h3 className='text-16-b border-b border-gray-100 px-16 pt-16 pb-8 text-gray-950 sm:px-16'>
        알림 {totalCount}개
      </h3>

      <ul className='flex flex-col'>
        {notifications.length === 0 && !isLoading ? (
          <NotiNull />
        ) : (
          notifications.map((noti) => (
            <li
              key={noti.id}
              className='hover:bg-primary-100 rounded-[0.375rem] transition-colors duration-150'
            >
              <NotiItem
                id={noti.id}
                content={noti.content}
                createdAt={noti.createdAt}
                onDelete={() => handleDelete(noti.id)}
                onClick={() => router.push('/profile/reservations')}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotiList;
