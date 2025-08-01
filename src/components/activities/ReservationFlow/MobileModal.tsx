'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { BaseModalProps } from '../Activities.types';
import CalendarStep from './CalendarStep';
import TimeSelectionStep from './TimeSelectionStep';
import PersonStep from './PersonStep';
import { getDateFromScheduleId } from '@/utils/activities/reservation';
import clsx from 'clsx';
import DraggableContainer from '@/components/common/DraggableContainer';
import { formatPrice } from '@/utils/formatPrice';
import { useDraggableBottomSheet } from '@/hooks/useDraggableBottomSheet';

type ModalStep = 'calendar' | 'person';

const THRESHOLD = 200;

const MobileModal = ({
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
  const [step, setStep] = useState<ModalStep>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const totalAmount = useMemo(() => formatPrice(price * headCount), [price, headCount]);

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

  // scheduleId로부터 날짜 계산
  useEffect(() => {
    const date = getDateFromScheduleId(schedules, scheduleId);
    setSelectedDate(date);
  }, [scheduleId, schedules]);

  // 열릴 때 스텝 초기화
  useEffect(() => {
    if (isModalOpen) {
      setStep('calendar');
    }
  }, [isModalOpen]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    onChangeSchedule(null); // 날짜 변경 시 시간 초기화
  };

  const handleTimeSelect = (id: number) => {
    onChangeSchedule(id);
  };

  const handleNextStep = () => {
    if (scheduleId) {
      setStep('person');
    }
  };

  const handleBackStep = () => {
    setStep('calendar');
  };

  const handleReservationConfirm = () => {
    if (scheduleId) {
      onConfirm();
    }
  };

  const isConfirmEnabled = scheduleId !== null;

  // 애니메이션 중엔 유지되도록
  if (!isModalOpen && !isClosing) return null;

  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/50' onClick={closeWithAnimation} />

      <DraggableContainer
        containerRef={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className='h-auto rounded-t-3xl p-24'
      >
        <div className='mb-30'>
          {step === 'calendar' ? (
            <h3 className='text-18-b'>날짜</h3>
          ) : (
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-8'>
                <button
                  onClick={handleBackStep}
                  className='relative size-24 cursor-pointer text-gray-500'
                >
                  <Image src={'/icons/icon_back.svg'} alt='뒤로 가기' fill />
                </button>
                <h3 className='text-18-b'>인원</h3>
              </div>
              <p className='text-16-m mt-8 text-[#4b4b4b]'>예약할 인원을 선택해주세요.</p>
            </div>
          )}
        </div>

        {step === 'calendar' ? (
          <div className='flex flex-col gap-16'>
            <CalendarStep
              schedules={schedules}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />

            <TimeSelectionStep
              selectedDate={selectedDate}
              schedules={schedules}
              scheduleId={scheduleId}
              onTimeSelect={handleTimeSelect}
            />

            <button
              className={clsx(
                'text-16-b mt-30 h-50 w-full rounded-[0.875rem] py-15',
                isConfirmEnabled
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : 'cursor-not-allowed bg-gray-300 text-gray-50',
              )}
              disabled={!isConfirmEnabled}
              onClick={handleNextStep}
            >
              확인
            </button>
          </div>
        ) : (
          <div className='flex flex-col gap-24'>
            <PersonStep headCount={headCount} onChangeHeadCount={onChangeHeadCount} />

            <div className='border-t-1 border-gray-200 pt-20'>
              <p className='text-16-b text-gray-950'>총 금액 : {totalAmount}</p>
            </div>

            <button
              className='bg-primary-500 text-16-b hover:bg-primary-600 mt-10 h-50 w-full rounded-[0.875rem] py-15 text-white'
              onClick={handleReservationConfirm}
            >
              확인
            </button>
          </div>
        )}
      </DraggableContainer>
    </>
  );
};

export default MobileModal;
