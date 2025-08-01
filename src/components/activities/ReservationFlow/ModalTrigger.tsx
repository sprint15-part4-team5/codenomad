import { useState } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import TabletModal from './TabletModal';
import MobileModal from './MobileModal';
import type { ModalTriggerProps } from '@/components/activities/Activities.types';
import { createPortal } from 'react-dom';
import { formatPrice } from '@/utils/formatPrice';
import { formatScheduleText, findScheduleById } from '@/utils/activities/reservation';

const ModalTrigger = ({
  activityData,
  scheduleId,
  onChangeSchedule,
  headCount,
  onChangeHeadCount,
  onReservationSubmit,
  onReservationReset,
}: ModalTriggerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const breakpoint = useResponsive();

  const price = formatPrice(activityData.price);
  const selectedSchedule = findScheduleById(activityData.schedules, scheduleId);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);

    const isNoReservationSelected = scheduleId === null || headCount < 1;
    if (isNoReservationSelected) {
      onReservationReset?.();
    }
  };

  const handleModalConfirm = () => {
    // 모달 내 확인 버튼: 상태는 유지
    setIsOpen(false);
  };

  const handleTriggerReservation = () => {
    if (selectedSchedule) {
      onReservationSubmit({
        scheduleId: selectedSchedule.id,
        headCount,
      });
    } else {
      handleOpenModal(); // 날짜 안 골랐으면 모달 띄움
    }
  };

  if (breakpoint === null) return null;

  const isTablet = breakpoint === 'md' || breakpoint === 'lg';

  return createPortal(
    <>
      <div className='sticky right-0 bottom-0 left-0 z-49 flex h-124 w-auto flex-col justify-center gap-12 border-t-1 border-[#e6e6e6] bg-white px-20 py-24'>
        <div className='flex justify-between'>
          <p className='text-18-b text-gray-950'>
            {price} <span className='text-16-b text-[#79747e]'>/ 명</span>
          </p>
          <button
            className='text-primary-500 text-16-b decoration-primary-500 underline decoration-2'
            onClick={handleOpenModal}
          >
            {selectedSchedule ? formatScheduleText(selectedSchedule) : '날짜 선택하기'}
          </button>
        </div>
        <button
          className={`h-50 w-auto rounded-[0.875rem] py-15 text-white transition-colors ${
            selectedSchedule
              ? 'bg-primary-500 hover:bg-primary-600'
              : 'cursor-not-allowed bg-gray-300'
          }`}
          onClick={handleTriggerReservation}
          disabled={!selectedSchedule}
        >
          예약하기
        </button>
      </div>

      {isTablet ? (
        <TabletModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          onConfirm={handleModalConfirm}
          schedules={activityData.schedules}
          scheduleId={scheduleId}
          onChangeSchedule={onChangeSchedule}
          headCount={headCount}
          onChangeHeadCount={onChangeHeadCount}
          price={activityData.price}
        />
      ) : (
        <MobileModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          onConfirm={handleModalConfirm}
          schedules={activityData.schedules}
          scheduleId={scheduleId}
          onChangeSchedule={onChangeSchedule}
          headCount={headCount}
          onChangeHeadCount={onChangeHeadCount}
          price={activityData.price}
        />
      )}
    </>,
    document.body,
  );
};

export default ModalTrigger;
