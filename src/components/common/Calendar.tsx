'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import Calendar from 'react-calendar';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';

// 클래스 병합 유틸리티
const cn = (...inputs: (string | undefined)[]) => twMerge(clsx(inputs));

// 캘린더 타입 정의
type CalendarValue = Date | null;

export interface CalendarProps {
  selectedDate?: CalendarValue;
  onChange?: (date: CalendarValue) => void;
  className?: string;

  // ========== 2025.07 추가: 고급 캘린더 기능 ==========

  // 날짜 비활성화 Props
  disabledDates?: Date[]; // 특정 날짜들을 배열로 비활성화
  isDateDisabled?: (date: Date) => boolean; // 동적 날짜 비활성화 로직 (예: 주말, 공휴일 등)

  // 커스텀 스타일링 Props
  tileClassName?: ({ date, view }: { date: Date; view: string }) => string; // 각 날짜별 동적 CSS 클래스 적용
  highlightedDates?: Date[]; // 특별한 날짜들을 강조 표시 (노란색 배경)

  // 클릭 검증 및 이벤트 처리
  onClickDay?: (date: Date, event?: React.MouseEvent<HTMLButtonElement>) => void; // 날짜 클릭 시 커스텀 로직 실행
  allowSelection?: (date: Date) => boolean; // 특정 날짜의 선택 가능 여부를 동적으로 결정

  // ================================================
}

const CalendarComponent = ({
  selectedDate,
  onChange,
  className,
  disabledDates = [],
  isDateDisabled,
  tileClassName,
  highlightedDates = [],
  onClickDay,
  allowSelection,
}: CalendarProps) => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [styleId] = useState(
    () => `calendar-styles-${Math.random().toString(36).substring(2, 11)}`,
  );

  // ========== 2025.07 추가: 성능 최적화를 위한 날짜 전처리 ==========
  // 비활성화할 날짜들을 문자열 Set으로 전처리 (성능 향상)
  const disabledDatesSet = useMemo(
    () => new Set(disabledDates.map((date) => new Date(date).toDateString())),
    [disabledDates],
  );

  // 강조 표시할 날짜들을 문자열 Set으로 전처리 (성능 향상)
  const highlightedDatesSet = useMemo(
    () => new Set(highlightedDates.map((date) => new Date(date).toDateString())),
    [highlightedDates],
  );

  // ========== 2025.07 추가: 날짜 비활성화 로직 ==========
  // react-calendar의 tileDisabled 콜백 함수 - 특정 날짜를 비활성화
  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return false;

    // 1. disabledDatesSet을 사용한 효율적인 날짜 비활성화 검사
    if (disabledDatesSet.has(date.toDateString())) {
      return true;
    }

    // 2. 커스텀 비활성화 함수 실행 (예: 주말, 공휴일 등)
    if (isDateDisabled) {
      return isDateDisabled(date);
    }

    return false;
  };

  // ========== 2025.07 추가: 동적 스타일링 로직 ==========
  // react-calendar의 tileClassName 콜백 함수 - 각 날짜에 동적 CSS 클래스 적용
  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';

    let classes = '';

    // 1. highlightedDatesSet을 사용한 효율적인 강조 날짜 검사
    if (highlightedDatesSet.has(date.toDateString())) {
      classes += ' highlighted-date'; // CSS에서 정의된 노란색 배경 클래스
    }

    // 2. 커스텀 클래스 함수가 있으면 실행하여 추가 클래스 적용
    if (tileClassName) {
      const customClass = tileClassName({ date, view });
      if (customClass) {
        classes += ` ${customClass}`;
      }
    }

    return classes.trim();
  };

  // ========== 2025.07 추가: 향상된 날짜 변경 처리 ==========
  // 기존 onChange를 대체하는 고급 변경 핸들러 - 유효성 검사 및 커스텀 로직 포함
  const handleDateChange = (value: unknown, event: React.MouseEvent<HTMLButtonElement>) => {
    // react-calendar의 Value 타입 안전성 검사 (Date | Date[] | null 가능)
    if (!value || Array.isArray(value) || !(value instanceof Date)) {
      return;
    }

    const dateValue = value as Date;

    // 1. allowSelection 함수로 선택 가능 여부 사전 검증
    if (allowSelection && !allowSelection(dateValue)) {
      event.preventDefault();
      return;
    }

    // 2. 비활성화된 날짜 클릭 방지
    if (tileDisabled({ date: dateValue, view: 'month' })) {
      event.preventDefault();
      return;
    }

    // 3. 커스텀 클릭 핸들러 우선 실행 (비즈니스 로직, 로깅 등)
    if (onClickDay) {
      onClickDay(dateValue, event);
    }

    // 4. 기본 onChange 핸들러 실행 (상태 업데이트)
    if (onChange) {
      onChange(dateValue);
    }
  };

  // 컴포넌트 범위 스타일링 적용
  useEffect(() => {
    // 기존 스타일이 있다면 제거
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // 새로운 스타일 요소 생성
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* 캘린더 컨테이너 기본 스타일 리셋 */
      .react-calendar {
        background: white !important;
        border: none !important;
        border-radius: none !important;
        box-shadow: none !important;
        font-family: inherit !important;
        line-height: 1.125em !important;
        width: 100% !important; /* 모바일 기본 */
      }

      /* 네비게이션 스타일 */
      .react-calendar__navigation {
        display: grid !important;
        grid-template-columns: auto 1fr auto auto !important;
        grid-template-areas: "label . prev next" !important;
        height: 24px !important;
        margin-bottom: 1em !important;
        padding: 0 !important;
        align-items: center !important;
        background: transparent !important;
        border: none !important;
        gap: 12px !important;
      }
      
      .react-calendar__navigation button {
        background: none !important;
        border: none !important;
        cursor: pointer !important;
        outline: none !important;
        padding: 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 4px !important;
        transition: background-color 0.2s !important;
      }
      
      .react-calendar__navigation button:hover {
        background-color: #ffffff !important;
      }
      
      .react-calendar__navigation__label {
        grid-area: label !important;
        text-align: left !important;
        font-weight: 500 !important;
        color: #000000 !important;
        font-size: 16px !important;
        margin: 0 !important;
      }
      
      /* 이전 버튼 */
      .react-calendar__navigation__prev-button {
        grid-area: prev !important;
      }
      
      /* 다음 버튼 */
      .react-calendar__navigation__next-button {
        grid-area: next !important;
      }
      
      /* 월/연 뷰 스타일 */
      .react-calendar__viewContainer {
        padding: 0 !important;
      }
      
      /* 월 뷰 스타일 */
      .react-calendar__month-view {
        padding: 0 !important;
      }
      
      /* 요일 헤더 스타일 */
      .react-calendar__month-view__weekdays {        
        text-align: center !important;
        text-transform: uppercase !important;
        font-weight: 600 !important;
        font-size: 16px !important;
        margin-bottom: 8px !important;
        padding: 0 !important;
        border-bottom: none !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      .react-calendar__month-view__weekdays__weekday {
        padding: 8px 0 !important;
        color: #49494C !important;
        background: transparent !important;
        border: none !important;
        text-decoration: none !important;
        border-bottom: none !important;
        box-shadow: none !important;
      }
      
      /* abbr 태그의 기본 스타일 제거 */
      .react-calendar abbr {
        text-decoration: none !important;
        border-bottom: none !important;
        border: none !important;
      }
      
      /* 날짜 타일 컨테이너 */
      .react-calendar__month-view__days {
        display: grid !important;
        grid-template-columns: repeat(7, 1fr) !important;
        row-gap: 4px !important; /* 모바일 기본 */
        column-gap: 0px !important;
        justify-items: center !important;
      }
      
      /* 태블릿 사이즈 */
      @media (min-width: 768px) and (max-width: 1023px) {
        .react-calendar__month-view__days {
          row-gap: 17.67px !important;
        }
      }
      
      /* PC 사이즈 */
      @media (min-width: 1024px) {
        .react-calendar__month-view__days {
          row-gap: 8px !important;
        }
      }
      
      /* 날짜 타일 기본 스타일 */
      .react-calendar__tile {
        width: 46px !important;
        height: 46px !important;
        padding: 0 !important;
        background: none !important;
        border: none !important;
        text-align: center !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 100% !important;
        transition: all 0.2s !important;
        color: #374151 !important;
        font-size: 16px !important;
        font-weight: 500 !important;
      }
      
      /* 날짜 타일 호버 효과 */
      .react-calendar__tile:hover {
        background-color: #f3f4f6 !important;
      }
      
      .react-calendar__tile--active:hover {
        background-color: #1e7517 !important;
      }
      
      /* 오늘 날짜 스타일 */
      .react-calendar__tile--now {
        background-color: #f1f7ee !important;
        color: #63a85d !important;
        font-weight: 600 !important;
      }
      
      /* 다른 월의 날짜 스타일 - 가장 높은 우선순위로 설정 */
      .react-calendar__month-view__days__day--neighboringMonth {
        color: #d1d5db !important;
      }
      
      /* 이전/다음 달 날짜는 항상 회색으로 (주말이어도) */
      .react-calendar__tile--neighboringMonth {
        color: #d1d5db !important;
      }
      
      .react-calendar__tile--neighboringMonth:hover {
        background-color: #f9fafb !important;
        color: #d1d5db !important;
      }

      
      /* ========== 2025.07 추가: 비활성화된 날짜 스타일 ========== */
      .react-calendar__tile:disabled {
        // background-color: #f9fafb !important;
        color: #d1d5db !important;
        cursor: not-allowed !important;
      }

      .react-calendar__month-view__days__day--neighboringMonth {
        color: #d1d5db !important;
      }
      
      /* ========== 2025.07 추가: 강조 표시된 날짜 스타일 ========== */
      /* highlightedDates 배열에 포함된 날짜들에 적용되는 노란색 강조 스타일 */
      .highlighted-date {
        color: #374151 !important; /* 갈색 텍스트 */
        font-weight: 600 !important; /* 글자 굵게 */
      }

      .react-calendar__tile--active {
        background-color: #31ae23 !important;
        color: #ffffff !important;
        border-radius: 100% !important;
      }
    `;

    document.head.appendChild(style);

    // 컴포넌트 언마운트 시 스타일 정리
    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [styleId]);

  return (
    <div ref={calendarRef} className={cn('inline-block', className)}>
      <Calendar
        value={selectedDate}
        onChange={handleDateChange} // 2025.07 수정: 기본 onChange → 고급 handleDateChange로 변경
        locale='ko-KR'
        calendarType='gregory'
        showNeighboringMonth={true}
        selectRange={false}
        returnValue='start'
        tileDisabled={tileDisabled} // 2025.07 추가: 날짜 비활성화 로직 연결
        tileClassName={getTileClassName} // 2025.07 추가: 동적 스타일링 로직 연결
        navigationLabel={({ date }) => (
          <span className='text-16-m text-left text-black'>
            {date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </span>
        )}
        prev2Label={null}
        next2Label={null}
        prevLabel={
          <Image src='/icons/icon_alt arrow_left.svg' alt='previous month' width={24} height={24} />
        }
        nextLabel={
          <Image src='/icons/icon_alt arrow_right.svg' alt='next month' width={24} height={24} />
        }
        formatShortWeekday={(_, date) => {
          const week = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
          return week[date.getDay()];
        }}
        formatDay={(_, date) => {
          return date.getDate().toString();
        }}
      />
    </div>
  );
};

export default CalendarComponent;
