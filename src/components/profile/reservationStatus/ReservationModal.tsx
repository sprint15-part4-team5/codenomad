import React, { useEffect } from 'react';
import type { ReservationData } from '@/components/profile/types/reservation';
import { format } from 'date-fns';
import DraggableContainer from '@/components/common/DraggableContainer';
import { useDraggableBottomSheet } from '@/hooks/useDraggableBottomSheet';
import { useResponsive } from '@/hooks/useResponsive'; // 훅 경로에 맞게 조정하세요

interface ReservationModalProps {
  selectedDate: Date;
  calendarCellRect: {
    top: number;
    left: number;
    width: number;
    height: number;
    modalTop?: number;
    modalLeft?: number;
  };
  selectedTab: '신청' | '승인' | '거절';
  selectedTime: string;
  timeOptions: string[];
  reservationDetails: ReservationData[];
  filteredReservations: ReservationData[];
  onTabChange: (tab: '신청' | '승인' | '거절') => void;
  onTimeChange: (time: string) => void;
  onClose: () => void;
  onApprove: (reservationId: number, scheduleId: number) => void;
  onDecline: (reservationId: number, scheduleId: number) => void;
}

const ReservationModal = ({
  selectedDate,
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
  // 페이지 스크롤 막기 (body + html)
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalHtmlHeight = document.documentElement.style.height;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.documentElement.style.height = '100vh';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.height = originalBodyHeight;
      document.documentElement.style.height = originalHtmlHeight;
    };
  }, []);

  // useResponsive 훅 사용
  const screenSize = useResponsive(); // 'sm', 'md', 'lg'
  const isMobile = screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const isPC = screenSize === 'lg';

  // 바텀시트 드래그 훅 (모바일/태블릿에서 사용)
  const { containerRef, closeWithAnimation, handleTouchStart, handleTouchMove, handleTouchEnd } =
    useDraggableBottomSheet({
      isOpen: !isPC,
      onClose,
      threshold: 120,
    });

  // 날짜 포맷 함수
  const formatDate = (date: Date) => format(date, 'yy년 M월 d일');

  // 탭별 예약 개수 계산 함수
  const getReservationCount = (tab: '신청' | '승인' | '거절') => {
    const statusMap = { 신청: 'pending', 승인: 'confirmed', 거절: 'declined' };
    return reservationDetails.filter((r) => r.status === statusMap[tab]).length;
  };

  // 태블릿 전용 바텀시트 레이아웃 (년월일 상단 → 탭 → 좌우 분할)
  const TabletModalContent = (
    <div className='relative mx-auto flex max-w-700 flex-col rounded-2xl px-3 pt-10 pb-8 md:px-12'>
      {/* 닫기 버튼은 모바일/태블릿에서 없앴음 */}

      {/* 1. 년월일 */}
      <div className='mb-6 text-center text-xl font-extrabold tracking-tight text-gray-900'>
        {formatDate(selectedDate)}
      </div>

      {/* 2. 상태 탭 */}
      <div className='mx-auto mb-7 flex w-full max-w-xl justify-center border-b'>
        {(['신청', '승인', '거절'] as const).map((tab) => (
          <button
            key={tab}
            className={`flex-1 border-b-2 py-3 text-lg font-bold transition-colors ${
              selectedTab === tab
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onTabChange(tab);
            }}
          >
            {tab} {getReservationCount(tab)}
          </button>
        ))}
      </div>

      {/* 3. 좌우 분할 영역 */}
      <div className='mx-auto flex w-full max-w-xl flex-row justify-center gap-8'>
        {/* 좌측: 예약 시간 드롭다운 */}
        <div className='flex w-[50%] max-w-220 min-w-180 flex-col'>
          <label className='mb-3 block text-base font-bold text-gray-900'>예약 시간</label>
          <select
            className='tablet-dropdown-style border-primary-500 focus:border-primary-500 block h-54 w-full rounded-2xl border-2 bg-white px-6 py-4 text-lg font-semibold text-gray-700 transition outline-none'
            value={selectedTime}
            onChange={(e) => onTimeChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            style={{ minHeight: 56, marginBottom: 8 }}
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 우측: 예약 내역 리스트 */}
        <div className='flex w-[50%] min-w-0 flex-1 flex-col'>
          <label className='mb-2 block text-sm font-semibold text-gray-700'>예약 내역</label>
          <div className='flex max-h-275 flex-col gap-4 overflow-y-auto'>
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation, i) => (
                <div
                  key={i}
                  className='border-primary-500 flex h-95 flex-row items-center justify-between overflow-hidden rounded-xl border-2 bg-white px-6 py-4'
                >
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-base text-gray-500'>닉네임</span>
                      <span className='font-semibold text-gray-900'>{reservation.nickname}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-base text-gray-500'>인원</span>
                      <span className='font-semibold text-gray-900'>{reservation.headCount}명</span>
                    </div>
                  </div>
                  <div className='ml-4 flex flex-col items-end gap-2'>
                    {selectedTab === '신청' ? (
                      <>
                        <button
                          className='flex-1 rounded-lg border border-blue-500 bg-blue-100 px-6 py-2 text-base font-semibold text-blue-500 hover:border-blue-600'
                          onClick={() =>
                            onApprove(reservation.id, parseInt(String(reservation.scheduleId), 10))
                          }
                        >
                          승인하기
                        </button>
                        <button
                          className='mt-2 flex-1 rounded-lg border border-red-500 bg-red-100 px-6 py-2 text-base font-semibold text-red-600 hover:border-red-600'
                          onClick={() =>
                            onDecline(reservation.id, parseInt(String(reservation.scheduleId), 10))
                          }
                        >
                          거절하기
                        </button>
                      </>
                    ) : selectedTab === '승인' ? (
                      <span className='rounded-lg bg-blue-100 px-5 py-2 text-base font-semibold text-blue-500'>
                        예약 승인
                      </span>
                    ) : (
                      <span className='rounded-lg bg-red-50 px-5 py-2 text-base font-semibold text-red-500'>
                        예약 거절
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className='py-8 text-center text-base text-gray-400'>예약 내역이 없습니다.</div>
            )}
          </div>
          {/* 닫기 버튼(태블릿/모바일에 없음) */}
        </div>
      </div>
    </div>
  );

  // PC 및 모바일 공통 ModalContent (PC에서만 닫기 버튼 보임)
  const ModalContent = (
    <>
      {isPC && (
        <button
          className='absolute top-6 right-6 text-2xl font-bold text-gray-400 hover:text-gray-700'
          onClick={onClose}
          aria-label='닫기'
          type='button'
        >
          ×
        </button>
      )}

      {/* 날짜 헤더 */}
      <div className='mb-6 w-full text-center text-lg font-bold'>{formatDate(selectedDate)}</div>

      {/* 탭 메뉴 */}
      <div className='mb-6 flex w-full border-b'>
        {(['신청', '승인', '거절'] as const).map((tab) => (
          <button
            key={tab}
            className={`flex-1 border-b-2 py-2 text-center font-semibold transition-colors ${
              selectedTab === tab
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onTabChange(tab);
            }}
          >
            {tab} {getReservationCount(tab)}
          </button>
        ))}
      </div>

      {/* 예약 시간 선택 */}
      <div className='mb-6 w-full'>
        <label className='mb-2 block text-sm font-semibold'>예약 시간</label>
        <select
          className='border-primary-500 h-54 w-full rounded-xl border-2 bg-white px-4 text-lg sm:px-10 sm:text-base md:text-lg'
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
        >
          {timeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* 예약 내역 리스트 */}
      <div className='mb-6 w-full'>
        <label className='mb-2 block text-sm font-semibold'>예약 내역</label>
        <div className='flex max-h-260 flex-col gap-4 overflow-y-auto'>
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation, i) => (
              <div
                key={i}
                className='border-primary-500 flex h-94 max-h-94 min-h-72 flex-row items-center justify-between overflow-hidden rounded-xl border-2 bg-white p-4 px-5 shadow-sm sm:rounded-2xl sm:p-5 md:px-10'
              >
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-500 sm:text-sm md:text-base'>닉네임</span>
                    <span className='text-sm font-semibold text-gray-900 sm:text-base md:text-lg'>
                      {reservation.nickname}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-500 sm:text-sm md:text-base'>인원</span>
                    <span className='text-sm font-semibold text-gray-900 sm:text-base md:text-lg'>
                      {reservation.headCount}명
                    </span>
                  </div>
                </div>

                <div className='ml-4 flex flex-col items-end gap-2'>
                  {selectedTab === '신청' ? (
                    <>
                      <button
                        className='flex-1 rounded-lg border border-blue-500 bg-blue-100 px-6 py-2 text-xs font-semibold text-blue-500 transition-colors hover:border-blue-600 sm:px-8 sm:py-2.5 sm:text-sm md:text-base'
                        onClick={() =>
                          onApprove(reservation.id, parseInt(String(reservation.scheduleId), 10))
                        }
                      >
                        승인하기
                      </button>
                      <button
                        className='mt-2 flex-1 rounded-lg border border-red-500 bg-red-100 px-6 py-2 text-xs font-semibold text-red-600 transition-colors hover:border-red-600 sm:px-8 sm:py-2.5 sm:text-sm md:text-base'
                        onClick={() =>
                          onDecline(reservation.id, parseInt(String(reservation.scheduleId), 10))
                        }
                      >
                        거절하기
                      </button>
                    </>
                  ) : selectedTab === '승인' ? (
                    <span className='rounded-lg bg-blue-100 px-6 py-2 text-xs font-semibold text-blue-500 sm:px-8 sm:py-2.5 sm:text-sm md:text-base'>
                      예약 승인
                    </span>
                  ) : selectedTab === '거절' ? (
                    <span className='rounded-lg bg-red-50 px-6 py-2 text-xs font-semibold text-red-500 sm:px-8 sm:py-2.5 sm:text-sm md:text-base'>
                      예약 거절
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className='py-4 text-center text-sm text-gray-400 sm:text-base md:text-lg'>
              예약 내역이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 닫기 버튼 PC에서만 노출 */}
    </>
  );

  // 렌더링 분기
  if (isTablet) {
    return (
      <div
        className='fixed inset-0 z-50 bg-black/50'
        onClick={closeWithAnimation}
        style={{ touchAction: 'none' }}
      >
        <DraggableContainer
          containerRef={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className='flex flex-col rounded-t-2xl px-3 pt-10 pb-8 shadow-lg md:px-12'
        >
          <div className='relative mx-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto px-2 pt-6 pb-10 md:px-4'>
            {TabletModalContent}
          </div>
        </DraggableContainer>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        className='fixed inset-0 z-50 bg-black/50'
        onClick={closeWithAnimation}
        style={{ touchAction: 'none' }}
      >
        <DraggableContainer
          containerRef={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className='mx-auto flex w-full flex-col rounded-t-2xl px-3 pt-10 pb-8 shadow-lg md:px-12'
        >
          <div className='relative mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto px-4 pt-2 pb-8'>
            {ModalContent}
          </div>
        </DraggableContainer>
      </div>
    );
  }

  if (isPC) {
    // PC 모드 - 화면 중앙 고정 모달 + 백드롭 + 배경 클릭 시 닫기 + 스크롤 잠금(이미 적용)
    return (
      <div
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
        onClick={onClose}
      >
        <div
          className='max-h-[90vh] w-420 flex-col items-center overflow-y-auto rounded-3xl bg-white p-20 shadow-xl transition-transform duration-300'
          style={{
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {ModalContent}
        </div>
      </div>
    );
  }

  return null;
};

export default ReservationModal;
