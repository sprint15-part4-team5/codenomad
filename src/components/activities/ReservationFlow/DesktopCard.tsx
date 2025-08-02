'use client';

import { useState, useEffect } from 'react';
import CalendarStep from './CalendarStep';
import TimeSelectionStep from './TimeSelectionStep';
import PersonStep from './PersonStep';
import { DesktopCardProps } from '../Activities.types';
import { formatPrice } from '@/utils/formatPrice';
import { getDateFromScheduleId } from '@/utils/activities/reservation';
import clsx from 'clsx';

const DesktopCard = ({
  activityData,
  scheduleId,
  onChangeSchedule,
  headCount,
  onChangeHeadCount,
  onReservationSubmit,
}: DesktopCardProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 선택된 스케줄 ID에 해당하는 날짜 찾기
  useEffect(() => {
    const date = getDateFromScheduleId(activityData.schedules, scheduleId);
    setSelectedDate(date);
  }, [scheduleId, activityData.schedules]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    onChangeSchedule(null); // 날짜 변경 시 선택된 시간 초기화
  };

  const handleTimeSelect = (id: number) => {
    onChangeSchedule(id);
  };

  const handleReservationConfirm = () => {
    if (scheduleId) {
      onReservationSubmit({ scheduleId, headCount });
    }
  };

  const isConfirmEnabled = scheduleId !== null;
  const price = formatPrice(activityData.price);
  const totalAmount = formatPrice(activityData.price * headCount);

  return (
    <div className='shadow-custom-5 sticky top-20 flex max-w-410 flex-col rounded-3xl bg-white p-30'>
      {/* 헤더 */}

      <p className='text-24-b mb-24 text-gray-950'>
        {price} <span className='text-20-m text-gray-600'>/ 인</span>
      </p>

      {/* 캘린더 섹션 */}
      <div className='mb-24 self-center'>
        <h4 className='text-16-b mb-8 text-gray-950'>날짜</h4>
        <CalendarStep
          schedules={activityData.schedules}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </div>

      <div className='mb-24'>
        <PersonStep variant='desktop' headCount={headCount} onChangeHeadCount={onChangeHeadCount} />
      </div>

      {/* 시간 선택 섹션 */}
      <div className='mb-24 flex flex-col gap-16'>
        <TimeSelectionStep
          selectedDate={selectedDate}
          schedules={activityData.schedules}
          scheduleId={scheduleId}
          onTimeSelect={handleTimeSelect}
        />
      </div>
      {/* 하단 예약 확정 버튼 */}
      <div className='flex items-center justify-between border-t-1 border-gray-200 pt-20'>
        <p className='text-16-b text-gray-950'>총 금액 : {totalAmount}</p>
        <button
          className={clsx(
            'text-16-b flex h-50 w-135 flex-col items-center justify-center rounded-[0.875rem]',
            isConfirmEnabled
              ? 'bg-primary-500 hover:bg-primary-600 text-white'
              : 'bg-gray-300 text-gray-50',
          )}
          disabled={!isConfirmEnabled}
          onClick={handleReservationConfirm}
        >
          예약하기
        </button>
      </div>
    </div>
  );
};

export default DesktopCard;
