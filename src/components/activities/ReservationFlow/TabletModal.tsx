'use client';

import { useState, useEffect, useMemo } from 'react';
import { BaseModalProps } from '../Activities.types';
import CalendarStep from './CalendarStep';
import TimeSelectionStep from './TimeSelectionStep';
import PersonStep from './PersonStep';
import { getDateFromScheduleId } from '@/utils/activities/reservation';
import { formatPrice } from '@/utils/formatPrice';
import clsx from 'clsx';
import DraggableContainer from '@/components/common/DraggableContainer';
import { useDraggableBottomSheet } from '@/hooks/useDraggableBottomSheet';

const THRESHOLD = 300;

const TabletModal = ({
  isOpen: isModalOpen,
  onClose,
  onConfirm,
  schedules,
  scheduleId,
  onChangeSchedule,
  headCount,
  onChangeHeadCount,
  price,
}: BaseModalProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const totalAmount = useMemo(() => formatPrice(price * headCount), [price, headCount]); // 값이 변경 될 때만 로직 수행

  // 커스텀 훅으로 드래그 로직 분리
  const {
    containerRef,
    isClosing,
    closeWithAnimation,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useDraggableBottomSheet({
    isOpen: isModalOpen,
    onClose,
    threshold: THRESHOLD,
  });

  useEffect(() => {
    const date = getDateFromScheduleId(schedules, scheduleId);
    setSelectedDate(date);
  }, [scheduleId, schedules]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    onChangeSchedule(null);
  };

  const handleTimeSelect = (id: number) => {
    onChangeSchedule(id);
  };

  const handleReservationConfirm = () => {
    if (scheduleId) onConfirm();
  };

  const isConfirmEnabled = scheduleId !== null;

  // 애니메이션 중에는 유지
  if (!isModalOpen && !isClosing) return null;

  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/50' onClick={closeWithAnimation} />

      <DraggableContainer
        containerRef={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className='h-auto rounded-t-3xl px-30 py-24'
      >
        <div className='mb-6 flex items-center justify-between'>
          <h3 className='text-18-b'>날짜</h3>
        </div>

        <div className='flex max-h-492 justify-center gap-24'>
          <CalendarStep
            schedules={schedules}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />

          <div className='shadow-custom-5 flex h-492 w-full flex-col gap-32 overflow-y-auto rounded-3xl p-24'>
            <TimeSelectionStep
              selectedDate={selectedDate}
              schedules={schedules}
              scheduleId={scheduleId}
              onTimeSelect={handleTimeSelect}
            />

            {selectedDate && (
              <>
                <PersonStep
                  variant='tablet'
                  headCount={headCount}
                  onChangeHeadCount={onChangeHeadCount}
                />
                <div className='border-t-1 border-gray-200 pt-20'>
                  <p className='text-16-b text-gray-950'>총 금액 : {totalAmount}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          className={clsx(
            'text-16-b mt-30 h-50 w-full rounded-[0.875rem] py-15',
            isConfirmEnabled
              ? 'bg-primary-500 text-white'
              : 'cursor-not-allowed bg-gray-300 text-gray-50',
          )}
          disabled={!isConfirmEnabled}
          onClick={handleReservationConfirm}
        >
          확인
        </button>
      </DraggableContainer>
    </>
  );
};

export default TabletModal;
