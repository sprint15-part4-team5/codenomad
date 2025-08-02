import { Schedule } from '../Activities.types';
import clsx from 'clsx';

interface TimeSelectionStepProps {
  selectedDate: string | null;
  schedules: Schedule[];
  scheduleId: number | null;
  onTimeSelect: (id: number) => void;
}

const TimeSelectionStep = ({
  selectedDate,
  schedules,
  scheduleId,
  onTimeSelect,
}: TimeSelectionStepProps) => {
  const filteredTimes = schedules.filter((s) => s.date === selectedDate);

  // 간단한 클릭 핸들러
  const handleTimeClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 바텀시트 드래그 방지
    onTimeSelect(id);
  };

  return (
    <>
      <p className='text-16-b text-gray-950'>예약 가능한 시간</p>
      {selectedDate ? (
        <div
          className='flex max-h-130 flex-col gap-8 overflow-y-auto'
          role='radiogroup'
          aria-label='예약 가능한 시간 선택'
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {filteredTimes.map((time) => (
            <button
              key={time.id}
              type='button'
              onClick={(e) => handleTimeClick(time.id, e)}
              style={{
                touchAction: 'manipulation', // 더블탭 줌 방지, 터치 최적화
                WebkitTapHighlightColor: 'transparent', // 모바일 터치 하이라이트 제거
              }}
              className={clsx(
                'text-16-m flex min-h-52 w-full cursor-pointer items-center justify-center rounded-[0.6875rem] border-2 text-center text-gray-950 transition-colors select-none',
                // 터치 피드백
                'active:scale-[0.98] active:transition-transform active:duration-75',
                // 마우스가 있는 기기에서만 호버
                'supports-hover:hover:text-primary-500 supports-hover:hover:border-primary-500 supports-hover:hover:bg-blue-50',
                scheduleId === time.id
                  ? 'border-primary-500 text-primary-500 bg-green-50'
                  : 'border-gray-300',
              )}
            >
              {time.startTime} ~ {time.endTime}
            </button>
          ))}
        </div>
      ) : (
        <p className='pt-24 pb-24 text-center text-gray-500'>날짜를 선택해주세요.</p>
      )}
    </>
  );
};

export default TimeSelectionStep;
