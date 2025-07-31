'use client';

import MapView from '@/components/activities/MapView';
import Image from 'next/image';
import { toast } from 'sonner';

interface ActivityMapSectionProps {
  address: string;
  category: string;
}

const ActivityMapSection = ({ address, category }: ActivityMapSectionProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('주소가 복사되었습니다.');
    } catch {
      toast.error('주소 복사에 실패하였습니다.');
    }
  };

  return (
    <section className='flex flex-col gap-8 border-b-1 border-gray-100'>
      <h2 className='text-18-b text-gray-950'>오시는 길</h2>
      <div className='flex items-center gap-8'>
        <p className='text-[0.875rem] font-semibold text-gray-950'>{address}</p>
        <button onClick={() => handleCopy()} className='size-20'>
          <Image src={'/icons/icon_copy.svg'} alt='주소 복사' width={20} height={20} />
        </button>
      </div>
      <MapView address={address} category={category} />
    </section>
  );
};

export default ActivityMapSection;
