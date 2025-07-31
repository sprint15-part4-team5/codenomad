import Image from 'next/image';
import ActivityDropdown from '@/components/activities/ActivityDropdown';
import type { ActivityDetail } from '@/components/activities/Activities.types';

interface ActivityHeaderProps {
  activity: ActivityDetail;
  isOwner: boolean;
  activityId: number;
}

const ActivityHeader = ({ activity, isOwner, activityId }: ActivityHeaderProps) => {
  return (
    <header className='flex justify-between border-b-1 border-gray-100 pb-12'>
      <div className='flex flex-col'>
        <p className='text-13-m mb-4 text-gray-700'>{activity.category}</p>
        <h1 className='text-18-b mb-16 text-gray-950'>{activity.title}</h1>
        <div className='mb-10 flex gap-0.5'>
          <Image src='/icons/icon_star_on.svg' alt='별' width={16} height={16} />
          <p className='text-14-m text-gray-700'>
            {activity.rating}({activity.reviewCount})
          </p>
        </div>
        <div className='flex gap-0.5'>
          <Image src='/icons/icon_map.svg' alt='지도 마크' width={16} height={16} />
          <p className='text-14-m text-gray-700'>{activity.address}</p>
        </div>
      </div>
      {isOwner && <ActivityDropdown activityId={activityId} />}
    </header>
  );
};

export default ActivityHeader;
