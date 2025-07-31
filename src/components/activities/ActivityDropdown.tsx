'use client';

import { useState } from 'react';
import Image from 'next/image';
import Dropdown from '@/components/common/Dropdown/Dropdown';
import CommonModal from '@/components/common/CancelModal';
import { useRouter } from 'next/navigation';
import { deleteMyActivity } from '@/lib/api/profile/myActivities';
import { toast } from 'sonner';
import showToastError from '@/lib/showToastError';

interface ActivityDropdownProps {
  activityId: number;
}

const FALLBACK_MESSAGE = '체험 삭제 중 문제가 발생했습니다.';

export default function ActivityDropdown({ activityId }: ActivityDropdownProps) {
  const route = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false);
    try {
      await deleteMyActivity(activityId);
      toast.success('체험이 삭제되었습니다.');
      route.push('/');
    } catch (err) {
      showToastError(err, { fallback: FALLBACK_MESSAGE });
    }
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger>
          <Image src={'/icons/icon_more.svg'} alt='드롭 다운' width={28} height={28} />
        </Dropdown.Trigger>
        <Dropdown.Content className='top-45 right-10'>
          <Dropdown.Item
            className='py-18'
            onClick={() => route.push(`/experiences/edit/${activityId}`)}
          >
            수정하기
          </Dropdown.Item>
          <Dropdown.Item className='py-18' onClick={handleDeleteClick}>
            삭제하기
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>

      <CommonModal
        open={isDeleteModalOpen}
        icon={
          <Image
            src={'/icons/icon_alert.svg'}
            alt='경고'
            width={49}
            height={49}
            className='md:h-88 md:w-88'
          />
        }
        text='체험을 삭제하시겠습니까?'
        cancelText='아니오'
        confirmText='네'
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
