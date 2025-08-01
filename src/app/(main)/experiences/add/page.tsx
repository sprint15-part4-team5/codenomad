'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TitleInput from '@/components/myExperiencesAddEdit/TitleInput';
import CategoryInput from '@/components/myExperiencesAddEdit/CategoryInput';
import DescriptionInput from '@/components/myExperiencesAddEdit/DescriptionInput';
import PriceInput from '@/components/myExperiencesAddEdit/PriceInput';
import AddressInput from '@/components/myExperiencesAddEdit/AddressInput';
import BannerImageInput from '@/components/myExperiencesAddEdit/BannerImageInput';
import IntroImagesInput from '@/components/myExperiencesAddEdit/IntroImagesInput';
import ReserveTimesInput from '@/components/myExperiencesAddEdit/ReserveTimesInput';
import ConfirmModal from '@/components/common/ConfirmModal';
import CommonModal from '@/components/common/CancelModal';
import { createExperience, uploadImage } from '@/lib/api/experiences';
import { experiencesSchema, FormValues } from '@/lib/schema/experiencesSchema';

const categoryOptions = [
  { value: '문화 · 예술', label: '문화 · 예술' },
  { value: '식음료', label: '식음료' },
  { value: '스포츠', label: '스포츠' },
  { value: '투어', label: '투어' },
  { value: '관광', label: '관광' },
  { value: '웰빙', label: '웰빙' },
];

const ExperienceAddPage = () => {
  // 예약 시간 state 선언 (최상단에!)
  const [reserveTimes, setReserveTimes] = useState<{ date: string; start: string; end: string }[]>([
    { date: '', start: '', end: '' },
  ]);

  // 입력값 상태
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [introImages, setIntroImages] = useState<File[]>([]);
  const [introPreviews, setIntroPreviews] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // const [submitError, setSubmitError] = useState<string | null>(null); // 미사용 변수 제거
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const router = useRouter();

  // 모달 오픈 시 body 스크롤 막기
  useEffect(() => {
    if (leaveModalOpen || modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [leaveModalOpen, modalOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(experiencesSchema),
    mode: 'onBlur',
    shouldUnregister: false, // 이 옵션 추가
  });

  // 컴포넌트 마운트 시 토큰 확인
  useEffect(() => {
    // 클라이언트 사이드에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.warn('로그인 토큰이 없습니다. 로그인이 필요할 수 있습니다.');
        // alert('체험 등록을 위해 로그인이 필요합니다.');
        // router.push('/login');
        // return;
      }
    }

    // API 연결 테스트 제거 (등록이 잘 작동하므로 불필요)
  }, []);

  // 최초 입력값 저장
  const initialValues = useRef({
    title: '',
    category: '',
    desc: '',
    price: '',
    address: '',
    detailAddress: '',
    bannerPreview: null,
    introPreviews: [],
    reserveTimes: JSON.stringify([{ date: '', start: '', end: '' }]),
  });

  // watch로 읽는 값들은 useCallback 등에서 사용하므로 먼저 선언
  const title = watch('title') || '';
  const category = watch('category') || '';
  const desc = watch('description') || '';
  const price = watch('price') || '';
  const address = watch('address') || '';
  const detailAddress = watch('detailAddress') || '';

  // 변경사항 비교
  const hasChanged = useCallback(() => {
    if (isSubmitting) return false;
    return (
      title !== initialValues.current.title ||
      category !== initialValues.current.category ||
      desc !== initialValues.current.desc ||
      price !== initialValues.current.price ||
      address !== initialValues.current.address ||
      detailAddress !== initialValues.current.detailAddress ||
      bannerPreview !== initialValues.current.bannerPreview ||
      JSON.stringify(introPreviews) !== JSON.stringify(initialValues.current.introPreviews) ||
      JSON.stringify(reserveTimes) !== initialValues.current.reserveTimes
    );
  }, [
    isSubmitting,
    title,
    category,
    desc,
    price,
    address,
    detailAddress,
    bannerPreview,
    introPreviews,
    reserveTimes,
  ]);

  // 예약시간 중복 체크 (빈 값 제외)
  const isDuplicateTime = useCallback(() => {
    const validTimes = reserveTimes
      .filter((rt) => rt.date && rt.start && rt.end)
      .map((rt) => `${rt.date}-${rt.start}-${rt.end}`);
    return new Set(validTimes).size !== validTimes.length;
  }, [reserveTimes]);

  // 폼 제출 핸들러 (중복 제출/디바운싱/유효성 검사 포함)
  const handleSubmitForm: SubmitHandler<FormValues> = useCallback(
    async (data) => {
      const currentTime = Date.now();
      if (isSubmitting || isSubmitted) return;
      if (currentTime - lastSubmitTime < 1000) return;
      setLastSubmitTime(currentTime);
      const validReserveTimes = reserveTimes.filter((rt) => rt.date && rt.start && rt.end);
      if (!banner || validReserveTimes.length === 0 || isDuplicateTime()) {
        alert('필수 항목을 모두 입력해 주세요.\n또는 예약 시간이 중복되었습니다.');
        return;
      }
      setIsSubmitting(true);
      try {
        // 이미지 업로드 및 데이터 준비
        const bannerUpload = await uploadImage(banner);
        const subImageUploads = await Promise.all(introImages.map(uploadImage));
        const experienceData = {
          title: data.title,
          category: data.category,
          description: data.description,
          price: parseInt(data.price),
          address: data.address,
          schedules: validReserveTimes.map((rt) => ({
            date: rt.date,
            startTime: rt.start,
            endTime: rt.end,
          })),
          bannerImageUrl: bannerUpload.activityImageUrl,
          subImageUrls: subImageUploads.map((u) => u.activityImageUrl),
        };
        await createExperience(experienceData);
        setIsSubmitted(true);
        setModalOpen(true);
      } catch (error) {
        console.error('체험 등록 실패:', error);
        alert('체험 등록에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, isSubmitted, lastSubmitTime, reserveTimes, banner, introImages, isDuplicateTime],
  );

  // 뒤로가기
  // 뒤로가기 핸들러
  const handleBackClick = useCallback(() => {
    if (hasChanged()) {
      setPendingAction(() => () => router.back());
      setLeaveModalOpen(true);
    } else {
      router.back();
    }
  }, [hasChanged, router]);

  // 새로고침/닫기/뒤로가기 경고
  // 새로고침/닫기/뒤로가기 경고 핸들러
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasChanged()) {
        e.preventDefault();
        e.returnValue = '';
      }
    },
    [hasChanged],
  );

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [
    handleBeforeUnload,
    title,
    category,
    desc,
    price,
    address,
    bannerPreview,
    introPreviews,
    reserveTimes,
  ]);

  // 모달 "네" 클릭
  // 나가기 모달 "네" 클릭 핸들러
  const handleLeave = useCallback(() => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setLeaveModalOpen(false);
  }, [pendingAction]);

  // 등록 완료 모달 "확인" 클릭 시
  // 등록 완료 모달 "확인" 클릭 핸들러
  const handleConfirm = useCallback(() => {
    setModalOpen(false);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    router.push('/profile/myExperiences');
  }, [handleBeforeUnload, router]);

  return (
    <div className='flex items-center justify-center'>
      <form
        className='flex w-375 flex-col px-24 py-30 md:w-744 md:px-30 md:pt-40 md:pb-53 lg:w-700 lg:px-0 lg:pb-102'
        onSubmit={handleSubmit(handleSubmitForm)}
        autoComplete='off'
      >
        {/* 뒤로가기 */}
        <div className='mb-24 flex items-center'>
          <button
            type='button'
            className='mr-8 md:hidden'
            onClick={handleBackClick}
            aria-label='뒤로가기'
          >
            <Image src='/icons/icon_back.svg' alt='뒤로가기' width={24} height={24} />
          </button>
          <h2 className='text-18-b'>내 체험 등록</h2>
        </div>
        <TitleInput<FormValues>
          register={register}
          error={errors.title?.message}
          value={watch('title') || ''}
        />
        <CategoryInput
          value={watch('category') || ''}
          onChange={(v) => setValue('category', v)}
          options={categoryOptions}
          error={errors.category?.message}
        />
        <DescriptionInput<FormValues>
          register={register}
          error={errors.description?.message}
          value={watch('description') || ''}
        />
        <PriceInput
          value={watch('price') || ''}
          error={errors.price?.message}
          register={register}
          path='price'
        />
        <AddressInput
          error={errors.address?.message}
          value={watch('address') || ''}
          onChange={(v) => setValue('address', v)}
          detailAddress={watch('detailAddress') || ''}
          onDetailAddressChange={(v) => setValue('detailAddress', v)}
          detailError={errors.detailAddress?.message}
        />
        <ReserveTimesInput value={reserveTimes} onChange={setReserveTimes} />
        <BannerImageInput
          bannerPreview={bannerPreview}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBanner(file);
            setBannerPreview(URL.createObjectURL(file));
          }}
          onRemove={() => {
            setBanner(null);
            setBannerPreview(null);
          }}
          banner={banner}
        />
        <IntroImagesInput
          introPreviews={introPreviews}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (introImages.length + files.length > 4) return;
            setIntroImages((prev) => [...prev, ...files].slice(0, 4));
            setIntroPreviews((prev) =>
              [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, 4),
            );
          }}
          onRemove={(idx) => {
            setIntroImages(introImages.filter((_, i) => i !== idx));
            setIntroPreviews(introPreviews.filter((_, i) => i !== idx));
          }}
        />
        {/* 등록 버튼 */}
        <div className='flex justify-center'>
          <button
            type='submit'
            disabled={isSubmitting || isSubmitted}
            className={`text-14-b h-41 w-120 rounded-[12px] py-12 text-white ${
              isSubmitting || isSubmitted
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-primary-500 hover:bg-primary-600'
            }`}
          >
            {isSubmitted ? '등록 완료' : isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
      {/* 등록 완료 모달 */}
      <ConfirmModal
        message='체험 등록이 완료되었습니다.'
        isOpen={modalOpen}
        onClose={handleConfirm}
      />
      {/* 나가기 확인 모달 */}
      <CommonModal
        open={leaveModalOpen}
        icon={
          <Image
            src='/icons/icon_alert.svg'
            alt='경고'
            width={24}
            height={24}
            className='h-full w-full'
          />
        }
        text={'저장되지 않았습니다.<br />정말 뒤로 가시겠습니까?'}
        cancelText='아니오'
        confirmText='네'
        onCancel={() => setLeaveModalOpen(false)}
        onConfirm={handleLeave}
      />
    </div>
  );
};

export default ExperienceAddPage;
