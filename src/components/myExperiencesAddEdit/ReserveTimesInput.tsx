import React, { useState } from 'react';
import Input from '@/components/common/Input';
import TimeDropdown from '@/components/common/TimeDropdown';
import Image from 'next/image';
import CalendarComponent from '@/components/common/Calendar';
import type { ReserveTime, ReserveTimesInputProps } from './MyExperiences';

const TIME_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});
// 종료시간 셀렉트: 00:00~23:00 + 24:00
const TIME_OPTIONS_END = [
  ...Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: `${hour}:00` };
  }),
  { value: '23:59', label: '다음날 00:00' },
];

// 시간 문자열을 분(minute) 단위로 변환
const timeToMinutes = (time: string) => {
  if (time === '24:00') return 0; // 다음날 00:00으로 처리
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// 시작=종료 여부
const isSameTime = (start: string, end: string) => {
  if (!start || !end) return false;
  return timeToMinutes(start) === timeToMinutes(end);
};

// 다음날 여부 판단 함수
const isNextDay = (start: string, end: string) => {
  if (!start || !end) return false;
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  // 종료가 시작보다 빠르면 다음날
  return endMin <= startMin;
};

const ReserveTimesInput = ({ value, onChange, isEdit = false }: ReserveTimesInputProps) => {
  const [reserveTimes, setReserveTimes] = useState<ReserveTime[]>(value);
  const [calendarOpenIdx, setCalendarOpenIdx] = useState<number | null>(null);

  // 외부 value prop이 바뀌면 내부 state도 동기화
  React.useEffect(() => {
    setReserveTimes(value);
  }, [value]);

  // 변경 시 부모에 알림
  const handleChange = (next: ReserveTime[]) => {
    setReserveTimes(next);
    onChange(next);
  };

  // 시간/날짜 변경
  const handleTimeChange = (idx: number, key: keyof ReserveTime, v: string) => {
    handleChange(reserveTimes.map((item, i) => (i === idx ? { ...item, [key]: v } : item)));
  };
  // 추가
  const handleAdd = () => {
    handleChange([{ date: '', start: '', end: '' }, ...reserveTimes]);
  };
  // 삭제
  const handleRemove = (idx: number) => {
    handleChange(reserveTimes.filter((_, i) => i !== idx));
  };
  // 중복 체크
  const isDuplicateTime = () => {
    const validTimes = reserveTimes
      .slice(1)
      .filter((rt) => rt.date && rt.start && rt.end)
      .map((rt) => `${rt.date}-${rt.start}-${rt.end}`);
    return new Set(validTimes).size !== validTimes.length;
  };

  return (
    <div className='mb-30'>
      <div className='text-16-b mb-18'>예약 가능한 시간대</div>
      {/* 라벨: 테블릿 이상에서만 보임 */}
      <div className='text-16-m mb-8 hidden items-center md:mb-10 md:flex'>
        <span className='lg:w-356.79 w-360'>날짜</span>
        <span className='lg:w-134.21 w-145 text-start md:mx-0 lg:ml-16'>시작 시간</span>
        <span className='w-122 text-start lg:w-122'>종료 시간</span>
      </div>
      {reserveTimes.map((rt, idx) => (
        <div key={idx} className='mb-16 md:mb-20'>
          {/* 구분선: "추가 인풋"과 "첫 번째 실제 일정" 사이에만 표시 */}
          {idx === 1 && (
            <>
              {/* 모바일 */}
              <div className='my-16 h-1 w-327 bg-gray-100 md:hidden' />
              {/* 테블릿 이상 */}
              <div className='my-20 hidden h-1 w-684 bg-gray-100 md:block' />
            </>
          )}
          <div className='flex flex-col items-center gap-4 md:flex-row md:gap-8'>
            {/* 날짜 인풋 */}
            <div className='w-327 md:w-344 lg:w-360'>
              <Input
                label=''
                placeholder='yyyy/mm/dd'
                className='text-16-m mb-10 w-full md:mb-0'
                type='text'
                value={rt.date}
                readOnly
                dateIcon={isEdit ? true : idx === 0}
                onDateIconClick={isEdit || idx === 0 ? () => setCalendarOpenIdx(idx) : undefined}
              />
              {/* 달력 아이콘 클릭 시 CalendarModal 노출 */}
              {calendarOpenIdx === idx && (isEdit || idx === 0) && (
                <div
                  className='fixed inset-0 z-49 flex items-center justify-center bg-black/50'
                  onClick={(e) => {
                    // 배경 클릭 시 모달 닫기
                    if (e.target === e.currentTarget) {
                      setCalendarOpenIdx(null);
                    }
                  }}
                >
                  <div
                    className='relative z-50 flex w-375 flex-col items-center rounded-lg bg-white p-24 shadow-lg md:w-407 lg:w-398'
                    onClick={(e) => {
                      // 모달 내부 클릭 시 이벤트 전파 중단
                      e.stopPropagation();
                    }}
                  >
                    <div className='mb-8 w-full'>
                      <h3 className='text-18-b text-left'>날짜</h3>
                    </div>
                    <div className='flex w-full justify-center'>
                      <CalendarComponent
                        selectedDate={rt.date ? new Date(rt.date) : null}
                        onChange={(date: Date | null) => {
                          if (date) {
                            // YYYY-MM-DD 형식으로 변환
                            const year = date.getFullYear();
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const day = date.getDate().toString().padStart(2, '0');
                            const dateString = `${year}-${month}-${day}`;
                            handleTimeChange(idx, 'date', dateString);
                            setCalendarOpenIdx(null); // 날짜 선택 후 모달 닫기
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setCalendarOpenIdx(null);
                      }}
                      className='text-14-m mt-16 w-full rounded-xl bg-gray-100 py-10 text-gray-700 transition-colors hover:bg-gray-200'
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* 시작시간,종료시간 인풋 */}
            <div className='flex items-center  gap-14 md:gap-10'>
              {/* 시작 시간 TimeDropdown 공통 컴포넌트 */}
              <TimeDropdown
                value={rt.start}
                onChange={(val) => handleTimeChange(idx, 'start', val)}
                options={TIME_OPTIONS}
                placeholder='시작 시간'
                className='w-124.5 md:w-122'
              />
              {/* - 구분선 */}
              <div className='text-20-b w-8 text-gray-800'>-</div>
              {/* 종료 시간 TimeDropdown 공통 컴포넌트 */}
              <TimeDropdown
                value={rt.end}
                onChange={(val) => handleTimeChange(idx, 'end', val)}
                options={TIME_OPTIONS_END}
                placeholder='종료 시간'
                className='w-124.5 md:w-122'
              />
              {/* + 또는 - 버튼 */}
              <div className='ml-8 flex items-center'>
                {idx === 0 ? (
                  <>
                    <button
                      type='button'
                      className='flex-shrink-0 cursor-pointer md:hidden'
                      onClick={handleAdd}
                    >
                      <Image
                        src='/icons/icon_blue_plus.svg'
                        alt='추가'
                        width={28}
                        height={28}
                        className='cursor-pointer'
                      />
                    </button>
                    <button
                      type='button'
                      className='hidden flex-shrink-0 cursor-pointer items-center justify-center md:flex'
                      onClick={handleAdd}
                    >
                      <Image
                        src='/icons/icon_blue_plus.svg'
                        alt='추가'
                        width={42}
                        height={42}
                        className='cursor-pointer'
                      />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type='button'
                      className='flex flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-50 md:hidden'
                      onClick={() => handleRemove(idx)}
                    >
                      <Image
                        src='/icons/icon_gray_minus.svg'
                        alt='제거'
                        width={28}
                        height={28}
                        className='cursor-pointer'
                      />
                    </button>
                    <button
                      type='button'
                      className='hidden flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-50 md:flex'
                      onClick={() => handleRemove(idx)}
                    >
                      <Image
                        src='/icons/icon_gray_minus.svg'
                        alt='제거'
                        width={42}
                        height={42}
                        className='cursor-pointer'
                      />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* 유효성 검사 메시지 */}
          {isSameTime(rt.start, rt.end) && (
            <div className='ml-8 text-sm text-red-500'>
              시작 시간과 종료 시간이 같을 수 없습니다.
            </div>
          )}
          {!isSameTime(rt.start, rt.end) && isNextDay(rt.start, rt.end) && (
            <div className='ml-8 text-sm text-gray-400'>
              종료 시간이 시작 시간보다 빠르면, 다음날로 간주됩니다.
            </div>
          )}
        </div>
      ))}
      {isDuplicateTime() && (
        <div className='text-red ml-8 text-sm'>
          같은 시간대에는 1개의 체험만 생성할 수 있습니다.
        </div>
      )}
    </div>
  );
};

export default ReserveTimesInput;
