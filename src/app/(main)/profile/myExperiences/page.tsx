'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ExperienceCard from '@/components/profile/ExperienceCard';
import { getMyActivities, deleteMyActivity } from '@/lib/api/profile/myActivities';
import type { MyActivity } from '@/components/profile/types/activity';
// 🆕 공통 컴포넌트 import (파일명 변경: index.ts → components.ts)
import { MobilePageHeader, LoadingSpinner } from '@/components/profile/common/components';
import CommonModal from '@/components/common/CancelModal';

// 🔢 무한 스크롤 설정: 한 번에 몇 개씩 로드할지 결정
const PAGE_SIZE = 5;

export default function MyExperiencesPage() {
  // 📋 체험 목록 데이터
  const [activities, setActivities] = useState<MyActivity[]>([]);

  // 🎯 무한 스크롤 관련 상태들
  const [cursorId, setCursorId] = useState<number | null>(null); // 다음 페이지 시작점 (마지막으로 로드된 체험의 ID)
  const [hasMore, setHasMore] = useState(true); // 더 로드할 데이터가 있는지 여부
  const [isLoading, setIsLoading] = useState(false); // 추가 로딩 중인지 (무한 스크롤용)
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 첫 페이지 로딩 중인지

  // 🎯 무한 스크롤 트리거 요소를 참조하는 ref
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // 🗑️ 삭제 모달 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // 🚀 무한 스크롤 핵심 함수: 체험 데이터를 가져오는 함수
  const fetchActivities = useCallback(async () => {
    // 🚫 중복 요청 방지: 더 이상 로드할 데이터가 없거나 이미 로딩 중이면 중단
    if (!hasMore || isLoading) return;

    // ⏳ 로딩 상태 시작
    setIsLoading(true);

    try {
      // 📡 API 호출: cursorId부터 PAGE_SIZE만큼 가져오기
      // cursorId가 null이면 처음부터, 있으면 해당 ID 다음부터
      const data = await getMyActivities(cursorId ?? undefined, PAGE_SIZE);

      // 📋 기존 데이터에 새 데이터 추가 (중복 제거)
      setActivities((prev) => {
        const ids = new Set(prev.map((a) => a.id)); // 기존 체험 ID들
        const newActivities = data.activities.filter((a) => !ids.has(a.id)); // 중복이 아닌 새 체험만
        return [...prev, ...newActivities]; // 기존 + 새 데이터 합치기
      });

      // 🎯 다음 요청을 위한 cursorId 업데이트 (마지막 체험의 ID)
      setCursorId(
        data.activities.length > 0 ? data.activities[data.activities.length - 1].id : null,
      );

      // 🏁 종료 조건 체크: 받은 데이터가 요청한 개수보다 적으면 더 이상 없다고 판단
      setHasMore(data.activities.length >= PAGE_SIZE);
    } catch {
      // ❌ 에러는 조용히 처리 (사용자에게는 빈 상태로 표시됨)
    } finally {
      // ✅ 로딩 상태 종료
      setIsLoading(false);
      setIsInitialLoading(false); // 초기 로딩도 완료
    }
  }, [cursorId, hasMore]); // cursorId나 hasMore가 변경될 때마다 함수 재생성

  // 🎬 컴포넌트 마운트 시 첫 번째 데이터 로드
  useEffect(() => {
    fetchActivities(); // 페이지 진입하자마자 첫 2개 체험 로드
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열 = 컴포넌트 마운트 시 한 번만 실행

  // 👀 무한 스크롤 핵심: IntersectionObserver 설정
  useEffect(() => {
    // 🔍 스크롤 감지기 생성
    const observer = new IntersectionObserver(
      (entries) => {
        // 📏 트리거 요소가 화면에 보이면 (10% 이상)
        if (entries[0].isIntersecting) {
          fetchActivities(); // 🚀 자동으로 다음 데이터 로드!
        }
      },
      { threshold: 0.1 }, // 트리거 요소가 10% 보이면 실행
    );

    // 🎯 감시할 요소 연결
    const loader = loaderRef.current;
    if (loader) {
      observer.observe(loader); // loaderRef 요소를 감시 시작
    }

    // 🧹 컴포넌트 언마운트 시 감시 해제 (메모리 누수 방지)
    return () => {
      if (loader) {
        observer.unobserve(loader);
      }
    };
  }, [cursorId, hasMore]); // cursorId나 hasMore가 변경될 때마다 observer 재설정

  // 🗑️ 삭제 모달 열기
  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  // 🗑️ 삭제 모달 닫기
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  // 🗑️ 실제 삭제 실행
  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteMyActivity(deleteTargetId);
      setActivities((prev) => prev.filter((a) => a.id !== deleteTargetId));
      closeDeleteModal();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  // 🎯 등록하기 버튼 컴포넌트 (actionButton으로 사용)
  const addExperienceButton = (
    <Link
      href='/experiences/add'
      className='bg-primary-500 flex h-48 w-138 items-center justify-center rounded-lg text-center text-base whitespace-nowrap text-white transition-colors'
    >
      <span className='flex h-full w-full items-center justify-center'>체험 등록하기</span>
    </Link>
  );

  return (
    <div className='mx-auto flex w-full flex-col justify-center p-24 lg:px-126'>
      <h1 className='text-18-b text-gray-950'>
        <MobilePageHeader
          title='내 체험 관리'
          description='내 체험에 예약된 내역들을 한 눈에 확인할 수 있습니다.'
          actionButton={addExperienceButton}
        />
      </h1>
      <section>
        {/* ⏳ 초기 로딩 상태 */}
        {isInitialLoading ? (
          <LoadingSpinner message='내 체험을 불러오는 중...' useLogo={true} />
        ) : (
          <>
            {/* 🎯 체험이 없는 경우: 빈 상태 표시 */}
            {activities.length === 0 && !isLoading ? (
              <div className='mx-auto flex min-h-[40vh] w-full max-w-2xl flex-col items-center justify-center rounded-2xl bg-white p-4 md:p-8'>
                <Image
                  src='/icons/no_experience.svg'
                  alt='empty'
                  width={120}
                  height={120}
                  className='mb-6'
                />
                <p className='mb-20 text-lg text-gray-500'>아직 등록한 체험이 없어요</p>
                {/* 📱 모바일에서만 보이는 등록 버튼 */}
                <Link
                  href='/experiences/add'
                  className='bg-primary-500 block flex h-48 w-138 items-center justify-center rounded-lg text-center text-base whitespace-nowrap text-white transition-colors'
                >
                  <span className='flex h-full w-full items-center justify-center'>
                    체험 등록하기
                  </span>
                </Link>
              </div>
            ) : null}

            {/* 📋 체험이 있을 때: ExperienceCard로 목록 렌더링 */}
            {activities.length > 0 && (
              <div className='flex w-full flex-col gap-6'>
                {activities.map((activity) => (
                  <ExperienceCard
                    key={activity.id}
                    id={activity.id}
                    title={activity.title}
                    rating={activity.rating}
                    reviews={activity.reviewCount}
                    price={activity.price}
                    image={activity.bannerImageUrl}
                    onDelete={handleDelete}
                  />
                ))}

                {/* 🎯 무한 스크롤 트리거 요소: IntersectionObserver가 감시하는 핵심 요소 */}
                {hasMore && ( // hasMore가 true일 때만 렌더링 (더 로드할 데이터가 있을 때)
                  <div
                    ref={loaderRef} // 🔗 IntersectionObserver가 감시하는 요소
                    className='flex justify-center py-4'
                  >
                    {isLoading && ( // 추가 로딩 중일 때만 메시지 표시
                      <div className='text-sm text-gray-500'>더 많은 체험을 불러오는 중...</div>
                    )}
                    {/* 
                    🎯 동작 원리:
                    1. 사용자가 스크롤해서 이 div가 화면에 10% 보이면
                    2. IntersectionObserver가 감지하고
                    3. fetchActivities() 자동 실행
                    4. 새 데이터 로드 완료
                    5. hasMore가 false가 되면 이 요소가 사라져서 무한 스크롤 종료
                  */}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 🗑️ 삭제 확인 모달 */}
        <CommonModal
          open={showDeleteModal}
          icon={<Image src='/icons/icon_cancel.svg' alt='delete' width={80} height={80} />}
          text='정말 삭제하시겠습니까?<br />삭제된 체험은 복구할 수 없습니다.'
          cancelText='취소'
          confirmText='삭제하기'
          onCancel={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      </section>
    </div>
  );
}
