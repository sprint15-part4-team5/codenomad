import React, { useEffect } from 'react';
import type { ReservationData } from '@/components/profile/types';

// 🎯 예약 모달 컴포넌트 Props
interface ReservationModalProps {
  // 📅 모달 기본 정보
  selectedDate: Date;
  calendarCellRect: {
    top: number;
    left: number;
    width: number;
    height: number;
    modalTop?: number;
    modalLeft?: number;
  };

  // 🎯 탭 및 시간 선택
  selectedTab: '신청' | '승인' | '거절';
  selectedTime: string;
  timeOptions: string[];

  // 📊 예약 데이터 (기존 방식과 동일하게 전체 + 필터링된 데이터 모두 전달)
  reservationDetails: ReservationData[]; // 전체 예약 데이터 (탭별 개수 계산용)
  filteredReservations: ReservationData[]; // 현재 선택된 탭의 필터링된 데이터

  // 🎭 이벤트 핸들러
  onTabChange: (tab: '신청' | '승인' | '거절') => void;
  onTimeChange: (time: string) => void;
  onClose: () => void;
  onApprove: (reservationId: number, scheduleId: number) => void;
  onDecline: (reservationId: number, scheduleId: number) => void;
}

// 🎯 예약 상태 모달 컴포넌트
// 역할: 특정 날짜의 예약 현황을 모달로 표시하고 승인/거절 처리
const ReservationModal = ({
  selectedDate,
  calendarCellRect,
  selectedTab,
  selectedTime,
  timeOptions,
  reservationDetails,
  filteredReservations,
  onTabChange,
  onTimeChange,
  onClose,
  onApprove,
  onDecline,
}: ReservationModalProps) => {
  // 🚫 모달이 열렸을 때 페이지 스크롤 방지
  useEffect(() => {
    // 현재 스크롤 위치 저장
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // 스크롤 방지
    document.body.style.overflow = 'hidden';

    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // 📊 탭별 예약 개수 계산 (기존 방식과 동일: 전체 데이터에서 계산)
  const getReservationCount = (tab: '신청' | '승인' | '거절') => {
    const statusMap = { 신청: 'pending', 승인: 'confirmed', 거절: 'declined' };
    return reservationDetails.filter((r) => r.status === statusMap[tab]).length;
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-start bg-black/50'
      onClick={(e) => {
        // 🎯 모달 외부 클릭시 닫기
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className='flex max-h-[90vh] w-[420px] translate-y-0 flex-col items-center overflow-y-auto rounded-3xl bg-white p-[20px] shadow-xl transition-transform duration-300'
        style={{
          position: 'absolute',
          top: `${calendarCellRect.modalTop || calendarCellRect.top}px`,
          left: `${calendarCellRect.modalLeft || calendarCellRect.left + calendarCellRect.width + 16}px`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ❌ 닫기 버튼 */}
        <button
          className='absolute top-6 right-6 text-2xl font-bold text-gray-400 hover:text-gray-700'
          onClick={onClose}
          aria-label='닫기'
          type='button'
        >
          ×
        </button>

        {/* 📅 날짜 헤더 */}
        <div className='mb-6 w-full text-center text-lg font-bold'>
          {selectedDate.getFullYear().toString().slice(2)}년 {selectedDate.getMonth() + 1}월{' '}
          {selectedDate.getDate()}일
        </div>

        {/* 🎯 탭 메뉴 (신청/승인/거절) */}
        <div className='mb-6 flex w-full border-b'>
          {(['신청', '승인', '거절'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 border-b-2 py-2 text-center font-semibold transition-colors ${
                selectedTab === tab
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400'
              }`}
              onClick={() => onTabChange(tab)}
            >
              {tab} {getReservationCount(tab)}
            </button>
          ))}
        </div>

        {/* ⏰ 예약 시간 선택 */}
        <div className='mb-6 w-full'>
          <label className='mb-2 block text-sm font-semibold'>예약 시간</label>
          <select
            className='h-54 w-full rounded-xl border bg-white px-10 text-base'
            value={selectedTime}
            onChange={(e) => onTimeChange(e.target.value)}
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 📋 예약 내역 리스트 */}
        <div className='mb-6 w-full'>
          <label className='mb-2 block text-sm font-semibold'>예약 내역</label>
          <div className='flex max-h-260 flex-col gap-4 overflow-y-auto'>
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation, i) => (
                <div
                  key={i}
                  className='flex h-94 max-h-94 min-h-94 flex-row items-center justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-4 px-20 shadow-sm'
                >
                  {/* 📊 예약자 정보 */}
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-gray-500'>닉네임</span>
                      <span className='font-semibold text-gray-900'>{reservation.nickname}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-gray-500'>인원</span>
                      <span className='font-semibold text-gray-900'>{reservation.headCount}명</span>
                    </div>
                  </div>

                  {/* 🎭 액션 버튼들 */}
                  <div className='ml-4 flex flex-col items-end gap-2'>
                    {selectedTab === '신청' ? (
                      <>
                        <button
                          className='flex-1 rounded-lg border border-blue-500 bg-blue-100 px-20 py-8 text-sm font-semibold text-blue-500 transition-colors hover:border-blue-500'
                          onClick={() =>
                            onApprove(reservation.id, parseInt(String(reservation.scheduleId), 10))
                          }
                        >
                          승인하기
                        </button>
                        <button
                          className='mt-2 flex-1 rounded-lg border border-red-500 bg-red-100 px-20 py-8 text-sm font-semibold text-red-600 transition-colors hover:border-red-600'
                          onClick={() =>
                            onDecline(reservation.id, parseInt(String(reservation.scheduleId), 10))
                          }
                        >
                          거절하기
                        </button>
                      </>
                    ) : selectedTab === '승인' ? (
                      <span className='rounded-lg bg-blue-100 px-20 py-8 text-sm font-semibold text-blue-500'>
                        예약 승인
                      </span>
                    ) : selectedTab === '거절' ? (
                      <span className='rounded-lg bg-red-50 px-20 py-8 text-sm font-semibold text-red-500'>
                        예약 거절
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className='py-4 text-center text-gray-400'>예약 내역이 없습니다.</div>
            )}
          </div>
        </div>

        {/* 🔚 닫기 버튼 */}
        <button
          className='mt-10 w-full rounded-xl bg-gray-100 py-3 font-semibold text-gray-700'
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default ReservationModal;
