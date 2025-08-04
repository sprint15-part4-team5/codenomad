'use client';

import { useState, useEffect, MouseEvent } from 'react';
import ReservationCalendar from '@/components/common/ReservationCalendar';
import {
  getReservationDashboard,
  getReservedSchedule,
  getReservations,
  updateReservationStatus,
} from '@/lib/api/profile/myActivitiesStatus';
import { getMyActivities } from '@/lib/api/profile/myActivities';
import {
  MobilePageHeader,
  LoadingSpinner,
  ErrorMessage,
} from '@/components/profile/common/components';
import ReservationModal from '@/components/profile/reservationStatus/ReservationModal';
import { useCalendarData } from '@/hooks/profile/hooks';
import type { MyActivity } from '@/components/profile/types/activity';
import type {
  ReservationData,
  ScheduleData,
  DashboardData,
  DashboardItem,
  ScheduleFromApi,
  ReservationCounts as ReservationCountData,
} from '@/components/profile/types';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ReservationStatusPage() {
  // 날짜 관련 상태
  const [date, setDate] = useState<Date | null>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 모달 내 탭/시간대 상태
  const [selectedTab, setSelectedTab] = useState<'신청' | '승인' | '거절'>('신청');
  const [selectedTime, setSelectedTime] = useState('14:00 - 15:00');

  // 모달 위치
  const [calendarCellRect, setCalendarCellRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    modalTop?: number;
    modalLeft?: number;
  } | null>(null);

  // 데이터 상태
  const [apiReservationData, setApiReservationData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myActivities, setMyActivities] = useState<MyActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<MyActivity | null>(null);
  const [reservationDetails, setReservationDetails] = useState<ReservationData[]>([]);
  const [scheduleDetails, setScheduleDetails] = useState<ScheduleData[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ReservationData[]>([]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 커스텀 훅 변환
  const calendarReservationData = useCalendarData(apiReservationData);

  // 예약 현황 대시보드(월별)
  const loadReservationDashboard = async (activityId: number, year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);
      const paddedMonth = month.toString().padStart(2, '0');
      const responseData = await getReservationDashboard(activityId, String(year), paddedMonth);

      const dashboardData: DashboardData = {};
      if (Array.isArray(responseData)) {
        (responseData as DashboardItem[]).forEach((item: DashboardItem) => {
          if (item.date && item.reservations) {
            dashboardData[item.date] = [
              {
                id: 'dashboard',
                timeSlot: '시간 미정',
                startTime: '시간',
                endTime: '미정',
                reservations: [item] as (DashboardItem | ReservationData)[],
                headCount: 0,
              },
            ];
          }
        });
      }
      setApiReservationData(dashboardData);

      await loadStatusBadgesWithReservedSchedule(
        activityId,
        Object.keys(dashboardData),
        dashboardData,
      );
    } catch {
      toast.error('예약 현황을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // fallback 데이터에서 예약 카운트 추출
  const extractCountsFromFallbackData = (fallbackData: ScheduleData[]): ReservationCountData => {
    const counts = { pending: 0, confirmed: 0, declined: 0, completed: 0 };
    fallbackData.forEach((schedule) => {
      if (schedule.reservations && Array.isArray(schedule.reservations)) {
        schedule.reservations.forEach((reservationGroup) => {
          if (
            reservationGroup &&
            'reservations' in reservationGroup &&
            typeof reservationGroup.reservations === 'object'
          ) {
            const dashboardItem = reservationGroup as DashboardItem;
            const groupCounts = dashboardItem.reservations;
            counts.pending += groupCounts.pending || 0;
            counts.confirmed += groupCounts.confirmed || 0;
            counts.declined += groupCounts.declined || 0;
            counts.completed += groupCounts.completed || 0;
          }
        });
      }
    });
    return counts;
  };

  // API 응답에서 예약 카운트 추출
  const extractCountsFromApiSchedules = (schedules: ScheduleFromApi[]): ReservationCountData => {
    const counts = { pending: 0, confirmed: 0, declined: 0, completed: 0 };
    schedules.forEach((schedule) => {
      if (schedule.count) {
        counts.pending += schedule.count.pending || 0;
        counts.confirmed += schedule.count.confirmed || 0;
        counts.declined += schedule.count.declined || 0;
      }
    });
    return counts;
  };

  // 시간 기반 상태 변환(승인→완료)
  const applyTimeBasedStatusConversion = (
    dateCounts: ReservationCountData,
    schedulesToCheck: (ScheduleFromApi | ScheduleData)[],
    date: string,
  ): ReservationCountData => {
    const now = new Date();
    const updatedCounts = { ...dateCounts };

    schedulesToCheck.forEach((schedule) => {
      const isApiSchedule = 'count' in schedule;
      const hasConfirmed = isApiSchedule
        ? (schedule as ScheduleFromApi).count?.confirmed &&
          (schedule as ScheduleFromApi).count!.confirmed > 0
        : updatedCounts.confirmed > 0;
      if (hasConfirmed) {
        const endTime = schedule.endTime || '23:59';
        const scheduleEndDateTime = new Date(`${date} ${endTime}`);
        if (now > scheduleEndDateTime) {
          const confirmedCount = isApiSchedule
            ? (schedule as ScheduleFromApi).count?.confirmed || 0
            : updatedCounts.confirmed;
          updatedCounts.confirmed -= confirmedCount;
          updatedCounts.completed += confirmedCount;
        }
      }
    });
    return updatedCounts;
  };

  // 단일 날짜의 상태 카운트 처리
  const processDateStatusCounts = async (
    activityId: number,
    date: string,
    dashboardData: DashboardData,
  ): Promise<ReservationCountData> => {
    try {
      const schedules = await getReservedSchedule(activityId, date);
      let dateCounts: ReservationCountData;
      let schedulesToCheck: (ScheduleFromApi | ScheduleData)[];
      if (schedules.length === 0) {
        const fallbackData = dashboardData[date];
        dateCounts =
          fallbackData?.length > 0
            ? extractCountsFromFallbackData(fallbackData)
            : { pending: 0, confirmed: 0, declined: 0, completed: 0 };
        schedulesToCheck = fallbackData || [];
      } else {
        dateCounts = extractCountsFromApiSchedules(schedules as ScheduleFromApi[]);
        schedulesToCheck = schedules as ScheduleFromApi[];
      }
      return applyTimeBasedStatusConversion(dateCounts, schedulesToCheck, date);
    } catch (err) {
      console.warn(`Failed to process status for ${date}:`, err);
      return { pending: 0, confirmed: 0, declined: 0, completed: 0 };
    }
  };

  // 상태뱃지데이터 갱신
  const updateStatusBadgeData = (statusBadgeData: { [date: string]: ReservationCountData }) => {
    if (typeof window !== 'undefined') {
      window.statusBadgeData = statusBadgeData;
    }
    if (Object.keys(statusBadgeData).length > 0) {
      setApiReservationData((prev) => ({ ...prev }));
    }
  };

  // 각 날짜별 정확한 예약 상태뱃지 정보 로드
  const loadStatusBadgesWithReservedSchedule = async (
    activityId: number,
    dates: string[],
    dashboardData: DashboardData,
  ) => {
    try {
      const statusResults = await Promise.allSettled(
        dates.map((date) => processDateStatusCounts(activityId, date, dashboardData)),
      );
      const statusBadgeData: { [date: string]: ReservationCountData } = {};
      dates.forEach((date, index) => {
        const result = statusResults[index];
        if (result.status === 'fulfilled') {
          statusBadgeData[date] = result.value;
        } else {
          console.warn(`Failed to process ${date}:`, result.reason);
          statusBadgeData[date] = { pending: 0, confirmed: 0, declined: 0, completed: 0 };
        }
      });
      updateStatusBadgeData(statusBadgeData);
    } catch (err) {
      console.error('Failed to load status badges:', err);
    }
  };

  // 특정 날짜의 시간대별 스케줄 정보(모달용)
  const loadReservedSchedule = async (activityId: number, date: string) => {
    try {
      setLoading(true);
      setError(null);
      const schedulesFromApi = await getReservedSchedule(activityId, date);
      const transformedSchedules: ScheduleData[] = (schedulesFromApi as ScheduleFromApi[]).map(
        (s: ScheduleFromApi) => ({
          id: s.id,
          scheduleId: s.scheduleId,
          timeSlot: `${s.startTime} - ${s.endTime}`,
          startTime: s.startTime,
          endTime: s.endTime,
          reservations: [],
          headCount: 0,
        }),
      );
      if (
        transformedSchedules.length === 0 ||
        transformedSchedules[0].timeSlot.includes('undefined')
      ) {
        const calendarData = apiReservationData[date];
        if (calendarData && calendarData.length > 0) {
          const fallbackSchedules = calendarData.map((schedule) => ({
            id: schedule.id,
            scheduleId: schedule.id,
            timeSlot: schedule.timeSlot || '시간 미정',
            startTime: schedule.startTime || '시간',
            endTime: schedule.endTime || '미정',
            reservations: schedule.reservations || [],
          }));
          setScheduleDetails(fallbackSchedules);
        } else {
          setScheduleDetails([]);
        }
      } else {
        setScheduleDetails(transformedSchedules);
      }
    } catch {
      toast.error('예약 스케줄을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async (activityId: number, scheduleId: number | string) => {
    try {
      if (
        scheduleId === 'dashboard' ||
        scheduleId === '시간' ||
        String(scheduleId).includes('undefined')
      ) {
        setReservationDetails([]);
        return;
      }
      const numericScheduleId = parseInt(String(scheduleId), 10);
      if (isNaN(numericScheduleId)) {
        console.error('Invalid scheduleId:', scheduleId);
        setError('잘못된 스케줄 ID입니다.');
        return;
      }
      setLoading(true);
      setError(null);
      const allReservations = [];
      const statuses = ['pending', 'confirmed', 'declined'];
      for (const status of statuses) {
        try {
          const data = await getReservations(activityId, numericScheduleId, status);
          if (data.reservations && data.reservations.length > 0) {
            allReservations.push(...data.reservations);
          }
        } catch (err) {
          console.warn(`Failed to load reservations for status ${status}:`, err);
        }
      }
      setReservationDetails(allReservations);
    } catch {
      toast.error('예약 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

      // 성공 메시지 표시
      toast.success(
        status === 'confirmed' ? '예약이 성공적으로 승인되었습니다.' : '예약이 거절되었습니다.',
      );

      if (selectedDate && selectedActivity) {
        const schedule = scheduleDetails.find((s) => s.timeSlot === selectedTime);
        if (schedule && (schedule.scheduleId !== undefined || schedule.id !== undefined)) {
          const scheduleIdToUse = schedule.scheduleId || schedule.id;
          await loadReservations(selectedActivity.id, scheduleIdToUse);
        }
      }
    } catch {
      // 실패 메시지 표시
      toast.error(
        status === 'confirmed' ? '예약 승인에 실패했습니다.' : '예약 거절에 실패했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMyActivities = async () => {
      try {
        setLoading(true);
        const data = await getMyActivities();
        if (data.activities && data.activities.length > 0) {
          setMyActivities(data.activities);
          setSelectedActivity(data.activities[0]);
        } else {
          setMyActivities([]); // 빈값 명시적
          // setError('등록된 체험이 없습니다.'); => 오류로 분기시키지 말고 빈 상태로 처리!
        }
      } catch {
        toast.error('체험 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyActivities();
  }, []);

  useEffect(() => {
    if (selectedActivity && date) {
      loadReservationDashboard(selectedActivity.id, date.getFullYear(), date.getMonth() + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActivity, date]);

  useEffect(() => {
    if (selectedDate && selectedActivity) {
      const dateStr = formatDate(selectedDate);
      loadReservedSchedule(selectedActivity.id, dateStr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedActivity]);

  useEffect(() => {
    if (scheduleDetails.length > 0 && scheduleDetails[0].timeSlot) {
      setSelectedTime(scheduleDetails[0].timeSlot);
    } else {
      setReservationDetails([]);
    }
  }, [scheduleDetails]);

  useEffect(() => {
    if (selectedDate && selectedActivity && selectedTime) {
      const schedule = scheduleDetails.find((s) => s.timeSlot === selectedTime);
      if (schedule && (schedule.scheduleId !== undefined || schedule.id !== undefined)) {
        const scheduleId = schedule.scheduleId || schedule.id;
        loadReservations(selectedActivity.id, scheduleId);
      }
    }
  }, [selectedDate, selectedActivity, selectedTime, scheduleDetails]);

  useEffect(() => {
    const newFiltered = reservationDetails.filter((r) => r.status === tabMap[selectedTab]);
    setFilteredReservations(newFiltered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationDetails, selectedTab]);

  const handleDayClick = (clickedDate: Date, event?: MouseEvent) => {
    if (typeof window === 'undefined') return;
    if (!selectedActivity) return;
    const key = formatDate(clickedDate);

    if (apiReservationData[key]) {
      setSelectedDate(clickedDate);
      setSelectedTab('신청');
      setSelectedTime('14:00 - 15:00');
      loadReservedSchedule(selectedActivity.id, key);
      if (event?.target) {
        const clickedElement = event.target as HTMLElement;
        const cellRect = clickedElement.getBoundingClientRect();
        const calendarContainer = clickedElement.closest('.react-calendar') as HTMLElement;
        if (!calendarContainer) return;
        const calendarRect = calendarContainer.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const modalWidth = 420;
        const modalHeight = 600;

        let modalLeft = cellRect.left + cellRect.width + 16;
        let modalTop = cellRect.top + window.scrollY;

        if (modalLeft + modalWidth > calendarRect.right) {
          modalLeft = cellRect.left - modalWidth - 16;
        }
        if (modalLeft < calendarRect.left) {
          modalLeft = calendarRect.left + 16;
        }
        if (modalTop + modalHeight > calendarRect.bottom + window.scrollY) {
          modalTop = calendarRect.bottom + window.scrollY - modalHeight - 16;
        }
        if (modalTop < calendarRect.top + window.scrollY) {
          modalTop = calendarRect.top + window.scrollY + 16;
        }
        if (modalLeft + modalWidth > viewportWidth) {
          modalLeft = viewportWidth - modalWidth - 16;
        }
        if (modalLeft < 16) {
          modalLeft = 16;
        }
        if (modalTop + modalHeight > viewportHeight + window.scrollY) {
          modalTop = viewportHeight + window.scrollY - modalHeight - 16;
        }
        if (modalTop < window.scrollY + 16) {
          modalTop = window.scrollY + 16;
        }
        setCalendarCellRect({
          top: cellRect.top,
          left: cellRect.left,
          width: cellRect.width,
          height: cellRect.height,
          modalTop: modalTop,
          modalLeft: modalLeft,
        });
      }
    } else {
      closeModal();
    }
  };

  const closeModal = () => setSelectedDate(null);

  const handleApproveReservation = (reservationId: number, scheduleId: number) => {
    if (!selectedActivity) return;
    handleReservationStatusUpdate(selectedActivity.id, reservationId, scheduleId, 'confirmed');
  };

  const handleDeclineReservation = (reservationId: number, scheduleId: number) => {
    if (!selectedActivity) return;
    handleReservationStatusUpdate(selectedActivity.id, reservationId, scheduleId, 'declined');
  };

  const timeOptions = scheduleDetails.map((s) => s.timeSlot);
  const tabMap = { 신청: 'pending', 승인: 'confirmed', 거절: 'declined' };

  if (loading && !selectedActivity) {
    return <LoadingSpinner message='체험 목록을 불러오는 중...' useLogo={true} />;
  }

  // 🚩 등록된 체험이 없을 때: 빈 상태 페이지 노출 (MyExperiencesPage와 동일)
  if ((!myActivities || myActivities.length === 0) && !loading) {
    return (
      <section className='mx-auto w-full max-w-2xl'>
        <MobilePageHeader
          title='예약 현황'
          description='내 체험에 예약된 내역들을 한 눈에 확인할 수 있습니다.'
        />
        <div className='mx-auto flex min-h-[40vh] w-full max-w-2xl flex-col items-center justify-center rounded-2xl p-4 md:p-8'>
          <Image
            src='/icons/no_experience.svg'
            alt='empty'
            width={120}
            height={120}
            className='mb-6'
          />
          <p className='mb-20 text-lg text-gray-500'>아직 등록한 체험이 없어요</p>
          <Link
            href='/experiences/add'
            className='bg-primary-500 block flex h-48 w-138 items-center justify-center rounded-lg text-center text-base whitespace-nowrap text-white transition-colors'
          >
            <span className='flex h-full w-full items-center justify-center'>체험 등록하기</span>
          </Link>
        </div>
      </section>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className='mx-auto flex w-full flex-col justify-center p-24 lg:px-126'>
      <h1 className='text-18-b text-gray-950'>
        <MobilePageHeader
          title='예약 현황'
          description='내 체험에 예약된 내역들을 한 눈에 확인할 수 있습니다.'
        />
      </h1>
      <section>
        <ReservationCalendar
          selectedDate={date}
          onDateChange={setDate}
          onDayClick={handleDayClick}
          onMonthChange={(newDate) => setDate(newDate)}
          reservationData={calendarReservationData}
          experiences={myActivities.map((act) => ({ ...act, id: act.id.toString() }))}
          selectedExperienceId={selectedActivity?.id.toString()}
          onExperienceChange={(experienceId) => {
            const newSelected = myActivities.find((act) => act.id.toString() === experienceId);
            if (newSelected) {
              setSelectedActivity(newSelected);
            }
          }}
        />
        {selectedDate && calendarCellRect && (
          <ReservationModal
            selectedDate={selectedDate}
            calendarCellRect={calendarCellRect}
            selectedTab={selectedTab}
            selectedTime={selectedTime}
            timeOptions={timeOptions}
            reservationDetails={reservationDetails}
            filteredReservations={filteredReservations}
            onTabChange={setSelectedTab}
            onTimeChange={setSelectedTime}
            onClose={closeModal}
            onApprove={handleApproveReservation}
            onDecline={handleDeclineReservation}
          />
        )}
      </section>
    </div>
  );
}
