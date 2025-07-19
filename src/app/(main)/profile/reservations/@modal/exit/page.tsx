'use client';
import CommonModal from '@/components/common/CancelModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Page = () => {
  const router = useRouter();
  const onDismiss = () => {
    router.back();
  };

  return (
    <CommonModal
      open={true}
      icon={
        <Image
          src='/icons/icon_alert.svg'
          alt='경고'
          width={24}
          height={24}
          className='h-full w-full'
        />
      }
      text={'저장되지 않았습니다.<br />정말 뒤로 가시겠습니까?'}
      cancelText='아니오'
      confirmText='네'
      onCancel={onDismiss}
      onConfirm={() => console.log(confirm)}
    />
  );
};

export default Page;
