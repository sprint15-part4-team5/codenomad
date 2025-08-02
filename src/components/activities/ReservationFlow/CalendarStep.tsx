import Calendar from '@/components/common/Calendar';
import { Schedule } from '../Activities.types';
import { useMemo, useCallback, useEffect } from 'react';
import { parseISO, startOfToday, isBefore } from 'date-fns';
import {
  stringToDate,
  checkDateDisabled,
  handleDateSelection,
  getInitialSelectedDate,
} from '@/utils/activities/reservation';

interface CalendarStepProps {
  schedules: Schedule[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const CalendarStep = ({ schedules, selectedDate, onDateSelect }: CalendarStepProps) => {
  // 예약 가능한 날짜 Set
  const availableDates = useMemo(() => new Set(schedules.map((s) => s.date)), [schedules]);

  // 예약 가능한 날짜들을 Date 배열로 변환 (highlightedDates용) - 오늘 이후 날짜만
  const highlightedDates = useMemo(() => {
    const today = startOfToday();

    return Array.from(availableDates)
      .map((dateStr) => parseISO(dateStr))
      .filter((date) => !isNaN(date.getTime())) // 유효한 날짜인지 확인
      .filter((date) => !isBefore(date, today)); // 오늘 이후 포함
  }, [availableDates]);

  // 오늘 날짜 자동 선택 로직
  useEffect(() => {
    const initialDate = getInitialSelectedDate(availableDates, selectedDate);
    if (initialDate && !selectedDate) {
      onDateSelect(initialDate);
    }
  }, [availableDates, selectedDate, onDateSelect]);

  // 날짜 비활성화 체크 함수
  const isDateDisabled = useCallback(
    (date: Date) => checkDateDisabled(date, availableDates),
    [availableDates],
  );

  // 날짜 선택 핸들러
  const handleDateChange = useCallback(
    (date: Date | null) => handleDateSelection(date, availableDates, onDateSelect),
    [availableDates, onDateSelect],
  );

  return (
    <Calendar
      selectedDate={selectedDate ? stringToDate(selectedDate) : null}
      onClickDay={handleDateChange}
      isDateDisabled={isDateDisabled}
      highlightedDates={highlightedDates}
    />
  );
};

export default CalendarStep;
