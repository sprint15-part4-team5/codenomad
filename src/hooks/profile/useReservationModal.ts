import { useState, useEffect } from 'react';
import {
  getReservedSchedule,
  getReservations,
  updateReservationStatus,
} from '@/lib/api/profile/myActivitiesStatus';
import type {
  ReservationData,
  ScheduleData,
  DashboardData,
  ScheduleFromApi,
} from '@/components/profile/types';

// 🎣 예약 모달 관리 커스텀 훅
// 역할: 모달 상태 + 스케줄/예약 데이터 로드 + 예약 상태 변경
export const useReservationModal = (
  apiReservationData: DashboardData,
  activityId: number | null,
) => {
  // 📅 모달 관련 상태
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTab, setSelectedTab] = useState<'신청' | '승인' | '거절'>('신청');
  const [selectedTime, setSelectedTime] = useState('14:00 - 15:00');

  // 📊 데이터 상태
  const [reservationDetails, setReservationDetails] = useState<ReservationData[]>([]);
  const [scheduleDetails, setScheduleDetails] = useState<ScheduleData[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🛠️ 유틸리티: Date를 YYYY-MM-DD로 변환
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 📅 특정 날짜의 시간대별 스케줄 정보 로드 (모달 표시용)
  // 역할: 선택된 날짜의 모든 시간대와 각 시간대별 예약 정보 가져오기
  // fallback: API 응답이 유효하지 않으면 캘린더 데이터를 대체 사용
  const loadReservedSchedule = async (activityId: number, date: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('loadReservedSchedule called with:', { activityId, date });

      // 🎯 주 API 호출: 특정 날짜의 스케줄 목록 가져오기
      const schedulesFromApi = await getReservedSchedule(activityId, date);
      console.log('getReservedSchedule raw response:', schedulesFromApi);

      // 🔄 API 응답을 UI에서 사용할 형태로 변환 (timeSlot 필드 생성)
      const transformedSchedules: ScheduleData[] = (schedulesFromApi as ScheduleFromApi[]).map(
        (s: ScheduleFromApi) => ({
          id: s.id,
          scheduleId: s.scheduleId,
          timeSlot: `${s.startTime} - ${s.endTime}`, // "14:00 - 15:00" 형태로 변환
          startTime: s.startTime,
          endTime: s.endTime,
          reservations: [], // API 응답에서는 빈 배열로 초기화
          headCount: 0,
        }),
      );

      console.log('Transformed schedules:', transformedSchedules);

      // 🔄 FALLBACK 로직 2: API 응답이 비어있거나 timeSlot이 제대로 생성되지 않은 경우
      if (
        transformedSchedules.length === 0 ||
        transformedSchedules[0].timeSlot.includes('undefined') // startTime 또는 endTime이 undefined인 경우
      ) {
        console.log('API response is empty or invalid, using calendar data as fallback');

        // 📋 캘린더 데이터에서 해당 날짜의 스케줄 정보 생성
        const calendarData = apiReservationData[date];
        if (calendarData && calendarData.length > 0) {
          // 🛠️ fallback 스케줄 생성: 캘린더 데이터를 모달용 형태로 변환
          const fallbackSchedules: ScheduleData[] = calendarData.map((schedule: ScheduleData) => ({
            id: schedule.id,
            scheduleId: schedule.id,
            timeSlot: schedule.timeSlot || '시간 미정', // 안전한 기본값 제공
            startTime: schedule.startTime || '시간',
            endTime: schedule.endTime || '미정',
            reservations: schedule.reservations || [], // 🔗 기존 예약 정보 유지
            headCount: schedule.headCount || 0,
          }));
          console.log('Using fallback schedules from calendar data:', fallbackSchedules);
          setScheduleDetails(fallbackSchedules);
        } else {
          // 📭 fallback 데이터도 없는 경우: 빈 배열로 설정
          setScheduleDetails([]);
        }
      } else {
        // ✅ 정상 API 응답인 경우: 변환된 스케줄 사용
        setScheduleDetails(transformedSchedules);
      }
    } catch (err) {
      setError('예약 스케줄을 불러오는데 실패했습니다.');
      console.error('Failed to load reserved schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  // 📋 특정 스케줄의 예약 목록 로드
  const loadReservations = async (activityId: number, scheduleId: number | string) => {
    try {
      // 🔄 'dashboard' 같은 임시 ID는 무시
      if (
        scheduleId === 'dashboard' ||
        scheduleId === '시간' ||
        String(scheduleId).includes('undefined')
      ) {
        console.log('🚫 임시 스케줄 ID로 예약 내역 조회 불가:', scheduleId);
        console.log(
          '💡 getReservedSchedule이 빈 응답을 주는 날짜의 모달에서는 예약 내역을 표시할 수 없습니다.',
        );
        setReservationDetails([]);
        return;
      }

      const numericScheduleId = parseInt(String(scheduleId), 10);
      if (isNaN(numericScheduleId)) {
        console.error('Invalid scheduleId:', scheduleId);
        setError('잘못된 스케줄 ID입니다.');
        return;
      }

      console.log('loadReservations called with:', { activityId, scheduleId, numericScheduleId });

      setLoading(true);
      setError(null);

      // 📊 모든 상태의 예약을 한 번에 가져오기 (pending, confirmed, declined)
      const allReservations = [];

      // 각 상태별로 예약을 가져와서 합치기
      const statuses = ['pending', 'confirmed', 'declined'];
      for (const status of statuses) {
        try {
          const data = await getReservations(activityId, numericScheduleId, status);
          console.log(`API response for ${status}:`, data);
          if (data.reservations && data.reservations.length > 0) {
            allReservations.push(...data.reservations);
          }
        } catch (err) {
          console.warn(`Failed to load reservations for status ${status}:`, err);
        }
      }

      console.log('All reservations loaded:', allReservations);
      console.log('Setting reservationDetails to:', allReservations);
      setReservationDetails(allReservations);
    } catch (err) {
      setError('예약 내역을 불러오는데 실패했습니다.');
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 예약 상태 변경 (승인/거절)
  const handleReservationStatusUpdate = async (
    activityId: number,
    reservationId: number,
    scheduleId: number | string,
    status: 'confirmed' | 'declined',
  ) => {
    try {
      setLoading(true);
      setError(null);
      await updateReservationStatus(activityId, reservationId, status);

      // 🔄 상태 업데이트 후 해당 스케줄의 예약 목록 다시 로드
      if (selectedDate) {
        const schedule = scheduleDetails.find((s) => s.timeSlot === selectedTime);
        if (schedule && (schedule.scheduleId !== undefined || schedule.id !== undefined)) {
          const scheduleIdToUse = schedule.scheduleId || schedule.id;
          await loadReservations(activityId, scheduleIdToUse);
        }
      }
    } catch (err) {
      setError('예약 상태 변경에 실패했습니다.');
      console.error('Failed to update reservation status:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 모달 닫기
  const closeModal = () => setSelectedDate(null);

  // 📊 탭 매핑
  const tabMap = { 신청: 'pending', 승인: 'confirmed', 거절: 'declined' };

  // 🔄 Effect: 날짜별 스케줄이 로드되면 첫 번째 시간을 기본 선택값으로 설정
  useEffect(() => {
    console.log('scheduleDetails updated:', scheduleDetails);
    if (scheduleDetails.length > 0 && scheduleDetails[0].timeSlot) {
      console.log('Setting selectedTime to first schedule timeSlot:', scheduleDetails[0].timeSlot);
      setSelectedTime(scheduleDetails[0].timeSlot);
    } else {
      console.log('No schedules available, keeping default selectedTime');
      setReservationDetails([]); // 스케줄이 없으면 예약 내역도 비움
    }
  }, [scheduleDetails]);

  // 🔄 Effect: 선택된 시간이 바뀌면 해당 예약 목록 로드
  useEffect(() => {
    if (selectedDate && selectedTime && activityId) {
      console.log('selectedTime:', selectedTime);
      console.log('scheduleDetails:', scheduleDetails);

      // selectedTime과 일치하는 스케줄 찾기
      const schedule = scheduleDetails.find((s) => s.timeSlot === selectedTime);

      console.log('Found schedule:', schedule);
      console.log('Schedule ID:', schedule?.scheduleId || schedule?.id);

      if (schedule && (schedule.scheduleId !== undefined || schedule.id !== undefined)) {
        const scheduleId = schedule.scheduleId || schedule.id;
        console.log(
          'Calling loadReservations with activityId:',
          activityId,
          'scheduleId:',
          scheduleId,
        );
        loadReservations(activityId, scheduleId);
      } else {
        console.warn('No matching schedule found for selectedTime:', selectedTime);
        console.warn(
          'Available schedules:',
          scheduleDetails.map((s) => ({
            id: s.id,
            scheduleId: s.scheduleId,
            timeSlot: s.timeSlot,
          })),
        );
        // 유효한 스케줄이 없으면 예약 목록을 비움
        setReservationDetails([]);
      }
    } else if (!activityId) {
      console.warn('activityId가 없어서 예약 목록을 로드할 수 없습니다.');
      setReservationDetails([]);
    }
  }, [selectedDate, selectedTime, scheduleDetails, activityId]);

  // 🔄 Effect: 탭이 바뀌면 예약 목록 필터링
  useEffect(() => {
    const newFiltered = reservationDetails.filter((r) => r.status === tabMap[selectedTab]);
    setFilteredReservations(newFiltered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationDetails, selectedTab]);

  return {
    // 📊 상태들
    selectedDate,
    selectedTab,
    selectedTime,
    reservationDetails,
    scheduleDetails,
    filteredReservations,
    loading,
    error,

    // 🎯 액션들
    setSelectedDate,
    setSelectedTab,
    setSelectedTime,
    loadReservedSchedule,
    loadReservations,
    handleReservationStatusUpdate,
    closeModal,
    formatDate,

    // 🛠️ 헬퍼들
    tabMap,
  };
};
