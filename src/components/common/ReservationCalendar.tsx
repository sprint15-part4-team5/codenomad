'use client';
import { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';

// 클래스 병합 유틸리티
const cn = (...inputs: (string | undefined)[]) => twMerge(clsx(inputs));

// 예약 상태 뱃지 컴포넌트
const StatusBadge = ({ status, count }: { status: string; count: number }) => {
  const colorMap: Record<string, string> = {
    예약: 'bg-yellow-100 text-yellow-700',
    승인: 'bg-blue-100 text-blue-600',
    거절: 'bg-red-100 text-red-600',
    완료: 'bg-green-100 text-green-600',
  };

  return (
    <span
      className={cn(
        'w-45.57 h-16 rounded px-1 py-px text-center leading-tight font-medium md:h-21 md:w-50 lg:w-67',
        'text-11-m md:text-14-m',
        colorMap[status] || 'bg-gray-100 text-gray-600',
      )}
    >
      {status} {count}
    </span>
  );
};

interface ReservationData {
  status: string;
  count: number;
  nickname: string;
}

interface ReservationCalendarProps {
  /** 선택된 날짜 */
  selectedDate: Date | null;
  /** 날짜 변경 콜백 */
  onDateChange: (date: Date) => void;
  /** 날짜 클릭 콜백 (예약이 있는 날짜만) */
  onDayClick: (date: Date, event?: React.MouseEvent) => void;
  /** 예약 데이터 */
  reservationData: Record<string, ReservationData[]>;
  /** 체험 목록 */
  experiences?: Array<{ id: string; title: string }>;
  /** 선택된 체험 ID */
  selectedExperienceId?: string;
  /** 체험 변경 콜백 */
  onExperienceChange?: (experienceId: string) => void;
  /** 월 변경 콜백 */
  onMonthChange?: (newDate: Date) => void;
}

const ReservationCalendar = ({
  selectedDate,
  onDateChange,
  onDayClick,
  reservationData,
  experiences = [{ id: 'default', title: '함께 배우면 즐거운 스트릿 댄스' }],
  selectedExperienceId = 'default',
  onExperienceChange,
  onMonthChange,
}: ReservationCalendarProps) => {
  const [date, setDate] = useState<Date | null>(selectedDate || new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // 캘린더 스타일 적용을 위한 useEffect
  useEffect(() => {
    const applyStyles = () => {
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 적용
      setTimeout(() => {
        if (calendarRef.current) {
          // 요일 헤더 border 적용
          const weekdaysElement = calendarRef.current.querySelector(
            '.react-calendar__month-view__weekdays',
          );
          if (weekdaysElement) {
            const element = weekdaysElement as HTMLElement;
            element.style.borderBottom = '1px solid #d1d5db';
            element.style.marginBottom = '12px';
          }

          // 네비게이션 화살표 버튼 크기 강제 설정
          const arrowButtons = calendarRef.current.querySelectorAll(
            '.react-calendar__navigation__arrow',
          );
          arrowButtons.forEach((button) => {
            const element = button as HTMLElement;
            element.style.width = '24px';
            element.style.height = 'auto';
            element.style.minWidth = '24px';
            element.style.minHeight = 'auto';
            element.style.maxWidth = '24px';
            element.style.maxHeight = 'auto';
            element.style.padding = '0';
            element.style.margin = '0';
            element.style.border = 'none';
            element.style.background = 'none';
            element.style.lineHeight = '1';
          });

          // 네비게이션 라벨(년월) 크기 조정
          const navigationLabel = calendarRef.current.querySelector(
            '.react-calendar__navigation__label',
          );
          if (navigationLabel) {
            const element = navigationLabel as HTMLElement;
            element.style.display = 'flex';
            element.style.justifyContent = 'center';
            element.style.alignItems = 'center';
            element.style.textAlign = 'center';
            element.style.width = 'auto';
            element.style.height = 'auto';
            element.style.padding = '0';
            element.style.margin = '0';
          }
        }
      }, 100);
    };

    applyStyles();
  }, [date]); // date가 변경될 때마다 다시 적용

  // 날짜를 yyyy-mm-dd 문자열로 변환
  const formatDate = (date: Date | null) => {
    if (!date) return '';

    // 로컬 시간대 기준으로 YYYY-MM-DD 형식 생성 (page.tsx와 동일)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // 날짜 변경 핸들러
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    onDateChange(newDate);
  };

  // 날짜 클릭 핸들러
  const handleDayClick = (clickedDate: Date, event?: React.MouseEvent) => {
    const key = formatDate(clickedDate);
    if (reservationData[key] && reservationData[key].length > 0) {
      onDayClick(clickedDate, event);
    }
  };

  return (
    <div className='shadow-custom-5 mx-0 flex w-375 flex-col gap-30 rounded-2xl bg-white md:w-full'>
      {/* 체험 선택 드롭다운 */}
      <div className='relative px-24 md:px-0'>
        <select
          className={cn(
            'text-16-m h-54 w-327 rounded-[16px] border border-gray-100 px-20 text-gray-950 md:w-full',
            'bg-white focus:border-blue-500 focus:outline-none',
            'appearance-none',
          )}
          value={selectedExperienceId}
          onChange={(e) => onExperienceChange?.(e.target.value)}
        >
          {experiences.map((experience) => (
            <option key={experience.id} value={experience.id}>
              {experience.title}
            </option>
          ))}
        </select>
        <div className='pointer-events-none absolute top-15 right-40 transform md:right-20 lg:right-25'>
          <Image src='/icons/icon_alt arrow_down.svg' alt='dropdown' width={24} height={24} />
        </div>
      </div>

      {/* 캘린더 - Tailwind CSS 클래스 사용 */}
      <div ref={calendarRef} className='w-full px-0 pb-30'>
        <Calendar
          value={date}
          onChange={(value) => handleDateChange(value as Date)}
          onActiveStartDateChange={({ activeStartDate }) =>
            activeStartDate && onMonthChange?.(activeStartDate)
          }
          calendarType='gregory'
          className={cn(
            // 이 부분이 캘린더 전체 컨테이너를 제어
            '!w-full !max-w-full !border-none !bg-transparent',

            // 캘린더 그리드 레이아웃 (날짜 셀들의 배치)
            '[&_.react-calendar__month-view__days]:!grid [&_.react-calendar__month-view__days]:!grid-cols-7',
            '[&_.react-calendar__month-view__days]:!w-full [&_.react-calendar__month-view__days]:!gap-0',

            // 날짜 타일 강제 크기 설정 - 컨테이너 크기에 맞춰 계산
            '[&_.react-calendar__tile]:!w-[calc((375px-60px)/7)] sm:[&_.react-calendar__tile]:!w-[calc((640px-60px)/7)]',
            '[&_.react-calendar__tile]:!h-[104px] sm:[&_.react-calendar__tile]:!h-[124px]',
            '[&_.react-calendar__tile]:!min-w-[calc((375px-60px)/7)] sm:[&_.react-calendar__tile]:!min-w-[calc((640px-60px)/7)]',
            '[&_.react-calendar__tile]:!max-w-[calc((375px-60px)/7)] sm:[&_.react-calendar__tile]:!max-w-[calc((640px-60px)/7)]',

            // 네비게이션 스타일
            '[&_.react-calendar__navigation]:!flex',
            '[&_.react-calendar__navigation]:!justify-center',
            '[&_.react-calendar__navigation]:!items-center',
            '[&_.react-calendar__navigation]:!mx-auto',
            '[&_.react-calendar__navigation]:!mb-4 [&_.react-calendar__navigation]:!h-12',
            '[&_.react-calendar__navigation]:!px-10 sm:[&_.react-calendar__navigation]:!px-30',

            // 네비게이션 라벨 (년월) 스타일
            '[&_.react-calendar__navigation__label]:!text-center',
            '[&_.react-calendar__navigation__label]:!flex',
            '[&_.react-calendar__navigation__label]:!justify-center',
            '[&_.react-calendar__navigation__label]:!items-center',
            '[&_.react-calendar__navigation__label]:!h-auto',
            '[&_.react-calendar__navigation__label]:!p-0',
            '[&_.react-calendar__navigation__label]:!m-0',

            // 네비게이션 화살표
            '[&_.react-calendar__navigation__arrow]:!text-2xl [&_.react-calendar__navigation__arrow]:!font-semibold',
            '[&_.react-calendar__navigation__arrow]:!border-none [&_.react-calendar__navigation__arrow]:!bg-none',
            '[&_.react-calendar__navigation__arrow]:!cursor-pointer [&_.react-calendar__navigation__arrow]:!text-gray-800',
            '[&_.react-calendar__navigation__arrow]:!h-full [&_.react-calendar__navigation__arrow]:!w-24',
            '[&_.react-calendar__navigation__arrow]:!min-h-full [&_.react-calendar__navigation__arrow]:!min-w-24',
            '[&_.react-calendar__navigation__arrow]:!max-w-24',
            '[&_.react-calendar__navigation__arrow]:!flex [&_.react-calendar__navigation__arrow]:!items-center',
            '[&_.react-calendar__navigation__arrow]:!justify-center [&_.react-calendar__navigation__arrow]:!p-0',
            '[&_.react-calendar__navigation__arrow]:!m-0 [&_.react-calendar__navigation__arrow]:!leading-none',
            '[&_.react-calendar__navigation__arrow]:!box-border [&_.react-calendar__navigation__arrow]:!overflow-hidden',

            // 요일 헤더
            '[&_.react-calendar__month-view__weekdays]:!flex',
            '[&_.react-calendar__month-view__weekdays]:!justify-between',
            '[&_.react-calendar__month-view__weekdays]:!h-55',

            // 개별 요일
            '[&_.react-calendar__month-view__weekdays__weekday]:!min-w-12 [&_.react-calendar__month-view__weekdays__weekday]:!flex-1',
            '[&_.react-calendar__month-view__weekdays__weekday]:!w-[calc((375px-60px)/7)] sm:[&_.react-calendar__month-view__weekdays__weekday]:!w-[calc((640px-60px)/7)]',
            '[&_.react-calendar__month-view__weekdays__weekday]:!h-[40px] sm:[&_.react-calendar__month-view__weekdays__weekday]:!h-[43px] lg:[&_.react-calendar__month-view__weekdays__weekday]:!h-[43px]',
            '[&_.react-calendar__month-view__weekdays__weekday]:!flex [&_.react-calendar__month-view__weekdays__weekday]:!items-center [&_.react-calendar__month-view__weekdays__weekday]:!justify-center',
            '[&_.react-calendar__month-view__weekdays__weekday]:!text-[13px] sm:[&_.react-calendar__month-view__weekdays__weekday]:!text-[16px]',
            '[&_.react-calendar__month-view__weekdays__weekday]:!font-bold',
            '[&_.react-calendar__month-view__weekdays__weekday]:!text-gray-700',
            "[&_.react-calendar__month-view__weekdays__weekday]:!font-['Pretendard',sans-serif]",

            // 일요일, 토요일 색상
            '[&_.react-calendar__month-view__weekdays__weekday:first-child_abbr]:!text-red-500',
            '[&_.react-calendar__month-view__weekdays__weekday:last-child_abbr]:!text-blue-500',

            // abbr 태그 점선 밑줄 제거
            '[&_abbr]:!no-underline',
            '[&_abbr]:!border-none',
            '[&_abbr]:!text-decoration-none',
          )}
          tileClassName={({ date, view }) => {
            if (view !== 'month') return '';
            const classes = [];
            // 오늘 날짜
            const today = new Date();
            if (
              date.getFullYear() === today.getFullYear() &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate()
            ) {
              classes.push('!bg-yellow-100'); // 오늘 날짜 노란색 (우선순위 높임)
            } else {
              classes.push('bg-white'); // 기본 배경
            }
            classes.push('hover:!bg-sky-100 transition-colors duration-150'); // hover도 !로 우선순위 높임
            return cn(
              '!w-[calc((375px-60px)/7)] sm:!w-[calc((640px-60px)/7)] !h-[104px] sm:!h-[124px] !min-w-[calc((375px-60px)/7)] !p-0',
              '!flex !flex-col !items-center !justify-start',
              '!border !border-gray-200 !rounded-lg',
              ...classes,
            );
          }}
          navigationLabel={({ date }) => (
            <span
              className={cn(
                'text-16-b md:text-20-b min-w-79 text-center tracking-tight whitespace-nowrap text-black md:min-w-99',
                "flex font-['Pretendard',sans-serif]",
              )}
            >
              {date.getFullYear()}년 {date.getMonth() + 1}월
            </span>
          )}
          prev2Label={null}
          next2Label={null}
          prevLabel={
            <Image
              src='/icons/icon_alt arrow_left.svg'
              alt='previous month'
              width={24}
              height={24}
            />
          }
          nextLabel={
            <Image src='/icons/icon_alt arrow_right.svg' alt='next month' width={24} height={24} />
          }
          formatShortWeekday={(_, date) => {
            const week = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            return week[date.getDay()];
          }}
          formatMonth={(locale, date) => `${date.getMonth() + 1}월`}
          formatDay={() => ''} // 기본 날짜 텍스트 숨기기
          tileContent={({
            date,
            view,
            activeStartDate,
          }: {
            date: Date;
            view: string;
            activeStartDate?: Date;
          }) => {
            if (view !== 'month') return null;
            const key = formatDate(date);
            const reservations = reservationData[key] || [];
            const hasStatus = reservations.length > 0;
            const statusList = ['예약', '승인', '거절', '완료'];

            // 현재 달 여부 판별
            const isCurrentMonth =
              activeStartDate &&
              date.getFullYear() === activeStartDate.getFullYear() &&
              date.getMonth() === activeStartDate.getMonth();
            // 오늘 날짜 판별
            const today = new Date();

            return (
              <div className='relative flex h-full w-full flex-col items-center'>
                {/* 날짜 숫자 */}
                <div className='relative flex w-full items-center justify-center pt-10 sm:pt-18'>
                  <span
                    className={cn(
                      // 오늘 날짜면 무조건 검은색 텍스트
                      date.getFullYear() === today.getFullYear() &&
                        date.getMonth() === today.getMonth() &&
                        date.getDate() === today.getDate()
                        ? 'font-semibold text-black'
                        : isCurrentMonth
                          ? 'font-semibold text-black'
                          : 'font-normal text-gray-300',
                      'text-16-m',
                    )}
                  >
                    {date.getDate()}
                  </span>
                  {hasStatus && (
                    <div className='absolute top-6 right-16 h-5 w-5 rounded-full bg-red-500 md:top-13 md:right-12 lg:right-35' />
                  )}
                </div>

                {/* 예약 상태 뱃지들 */}
                <div className='mt-1 flex w-full flex-1 flex-col items-center gap-5 overflow-x-hidden overflow-y-auto'>
                  {statusList.map((status) => {
                    // 해당 상태의 모든 count 값을 합산
                    const totalCount = reservations
                      .filter((r) => r.status === status)
                      .reduce((sum, r) => sum + (r.count || 1), 0);

                    return totalCount > 0 ? (
                      <StatusBadge key={status} status={status} count={totalCount} />
                    ) : null;
                  })}
                </div>
              </div>
            );
          }}
          onClickDay={(date, event) => handleDayClick(date, event)}
        />
      </div>
    </div>
  );
};

export default ReservationCalendar;
