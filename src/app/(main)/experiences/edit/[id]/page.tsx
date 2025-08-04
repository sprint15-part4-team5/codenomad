'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams, useRouter, usePathname } from 'next/navigation';
import isEqual from 'lodash/isEqual';
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
import LoadingPage from '@/components/common/LoadingPage';
import { uploadImage, updateExperience, getExperienceDetail } from '@/lib/api/experiences';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { experiencesSchema, FormValues } from '@/lib/schema/experiencesSchema';
import type { SubmitHandler } from 'react-hook-form';
import showToastError from '@/lib/showToastError';

const categoryOptions = [
  { value: '문화 · 예술', label: '문화 · 예술' },
  { value: '식음료', label: '식음료' },
  { value: '스포츠', label: '스포츠' },
  { value: '투어', label: '투어' },
  { value: '관광', label: '관광' },
  { value: '웰빙', label: '웰빙' },
];

interface ReserveTime {
  id?: number;
  date: string;
  start: string;
  end: string;
}

interface ExperienceData {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  address: string;
  bannerImageUrl: string;
  subImages: Array<{
    id: number;
    imageUrl: string;
  }>;
  schedules: Array<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  }>;
  userId: string | number; // 작성자 id 추가
}

import { useAuthStore } from '@/store/useAuthStore';

const ExperienceEditPage = () => {
  // ...existing code...

  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;
  const pathname = usePathname();

  // 로그인 유저 정보
  const { user } = useAuthStore();

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false); // 페이지 이동 로딩
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(true); // 본인 여부

  // 입력값 상태 (react-hook-form만 사용)
  const [reserveTimes, setReserveTimes] = useState<ReserveTime[]>([
    { date: '', start: '', end: '' },
  ]);
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [introPreviews, setIntroPreviews] = useState<string[]>([]);
  // 서버에서 받아온 subImages의 id와 url을 저장
  const [serverSubImages, setServerSubImages] = useState<{ id: number; imageUrl: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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
  // 새로 업로드된 이미지와 미리보기 URL을 매핑하는 Map
  const [imageUrlMap, setImageUrlMap] = useState<Map<string, File>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 수정 여부 상태 관리
  const [isModified, setIsModified] = useState(false);

  // 초기 데이터 저장
  const [initialData, setInitialData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    address: '',
    bannerPreview: '',
    introPreviews: [] as string[],
    reserveTimes: [] as ReserveTime[],
  });

  // 폼 관련 설정
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(experiencesSchema),
    mode: 'onBlur',
    shouldUnregister: false, // 이 옵션 추가
    defaultValues: {
      title: '',
      category: '',
      price: '',
      address: '',
      description: '',
      detailAddress: '', // 필요시
    },
  });

  // 체험 데이터 불러오기
  useEffect(() => {
    const fetchExperienceData = async () => {
      if (!experienceId) return;

      try {
        setLoading(true);
        setError(null);

        const data: ExperienceData = await getExperienceDetail(experienceId);

        // userId 비교 (string/number 모두 지원)
        if (!user || String(data.userId) !== String(user.id)) {
          setIsOwner(false);
          setLoading(false);
          return;
        } else {
          setIsOwner(true);
        }

        // subImages에서 imageUrl만 추출 및 id 저장
        const subImageUrls = data.subImages?.map((img) => img.imageUrl) || [];
        setServerSubImages(data.subImages || []);

        // 상태 업데이트
        setValue('title', data.title);
        setValue('category', data.category);
        setValue('description', data.description);
        setValue('price', String(data.price));
        setValue('address', data.address);
        setBannerPreview(data.bannerImageUrl);
        setIntroPreviews(subImageUrls);

        // 스케줄 데이터 변환
        const convertedSchedules = data.schedules.map((schedule) => ({
          id: schedule.id,
          date: schedule.date,
          start: schedule.startTime,
          end: schedule.endTime,
        }));

        // 첫 번째 줄은 항상 빈 줄(새로운 시간 추가용), 기존 스케줄들은 두 번째 줄부터
        const reserveTimesWithEmptyFirst =
          convertedSchedules.length > 0
            ? [{ date: '', start: '', end: '' }, ...convertedSchedules]
            : [{ date: '', start: '', end: '' }];

        setReserveTimes(reserveTimesWithEmptyFirst);

        // 폼 필드 값도 동기화
        setValue('title', data.title);
        setValue('category', data.category);
        setValue('description', data.description);
        setValue('price', String(data.price));
        setValue('address', data.address);
        // 필요시 detailAddress도 추가 가능

        // 초기값 저장 (변경사항 감지용)
        setInitialData({
          title: data.title,
          category: data.category,
          description: data.description,
          price: String(data.price),
          address: data.address,
          bannerPreview: data.bannerImageUrl,
          introPreviews: subImageUrls,
          reserveTimes: reserveTimesWithEmptyFirst,
        });
      } catch (error: unknown) {
        showToastError(error, { fallback: '데이터를 불러오는데 실패했습니다.' });
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchExperienceData();
  }, [experienceId, setValue, user]);

  // 변경사항 확인 (깊은 비교) - react-hook-form의 watch 사용
  const watchedTitle = watch('title');
  const watchedCategory = watch('category');
  const watchedDesc = watch('description');
  const watchedPrice = watch('price');
  const watchedAddress = watch('address');
  useEffect(() => {
    const currentData = {
      title: watchedTitle,
      category: watchedCategory,
      description: watchedDesc,
      price: watchedPrice,
      address: watchedAddress,
      bannerPreview,
      introPreviews,
      reserveTimes,
    };
    setIsModified(!isEqual(currentData, initialData));
  }, [
    watchedTitle,
    watchedCategory,
    watchedDesc,
    watchedPrice,
    watchedAddress,
    bannerPreview,
    introPreviews,
    reserveTimes,
    initialData,
  ]);

  // 변경사항 비교 (단순화)
  const hasChanged = useCallback(() => {
    return isModified && !isSubmitting && !loading;
  }, [isModified, isSubmitting, loading]);

  // 예약시간 중복 체크 (첫 번째 항목 제외 - 새로운 시간 추가용)
  const isDuplicateTime = useCallback(() => {
    const validTimes = reserveTimes
      .slice(1)
      .filter((rt) => rt.date && rt.start && rt.end)
      .map((rt) => `${rt.date}-${rt.start}-${rt.end}`);
    return new Set(validTimes).size !== validTimes.length;
  }, [reserveTimes]);

  // 수정하기 (add 페이지처럼 정리)
  const handleSubmit: SubmitHandler<FormValues> = async (data) => {
    const validReserveTimes = reserveTimes.slice(1).filter((rt) => rt.date && rt.start && rt.end);
    if (
      !data.title ||
      !data.category ||
      !data.description ||
      !data.price ||
      !data.address ||
      !bannerPreview ||
      validReserveTimes.length === 0 ||
      isDuplicateTime()
    ) {
      showToastError(
        '필수 항목을 모두 입력해 주세요.\n최소 하나의 예약 시간이 필요하며, 중복된 시간대는 불가능합니다.',
      );
      return;
    }
    try {
      setIsSubmitting(true);
      const numericPrice = parseInt(data.price.replace(/[^0-9]/g, ''));
      let finalBannerUrl = bannerPreview;
      if (banner) {
        try {
          const bannerUpload = await uploadImage(banner);
          finalBannerUrl = bannerUpload.activityImageUrl;
        } catch (uploadError) {
          showToastError(uploadError, {
            fallback: '배너 이미지 업로드에 실패했습니다. 다시 시도해 주세요.',
          });
          throw new Error('배너 이미지 업로드에 실패했습니다. 다시 시도해 주세요.');
        }
      }
      // 새로 추가된 이미지 업로드
      const subImageUrlsToAdd: string[] = [];
      for (const preview of introPreviews) {
        if (preview.startsWith('blob:')) {
          const file = imageUrlMap.get(preview);
          if (file) {
            try {
              const upload = await uploadImage(file);
              subImageUrlsToAdd.push(upload.activityImageUrl);
            } catch (uploadError) {
              showToastError(uploadError, {
                fallback: '이미지 업로드에 실패했습니다. 다시 시도해 주세요.',
              });
              throw new Error('이미지 업로드에 실패했습니다. 다시 시도해 주세요.');
            }
          }
        }
      }

      // 삭제된 subImages id 계산 (서버에 있던 이미지 중, introPreviews에 없는 것)
      const removedSubImageIds = serverSubImages
        .filter((img) => !introPreviews.includes(img.imageUrl))
        .map((img) => img.id);

      // 스케줄 변경/추가/삭제 계산 (기존 코드 유지)
      const currentInitialSchedules = initialData.reserveTimes.filter((rt) => rt.id);
      const currentInitialSchedulesMap = new Map(currentInitialSchedules.map((rt) => [rt.id, rt]));
      const newScheduleIds = reserveTimes.filter((rt) => rt.id).map((rt) => rt.id!);
      const scheduleIdsToRemove = currentInitialSchedules
        .map((rt) => rt.id!)
        .filter((id) => !newScheduleIds.includes(id));
      const changedSchedules = reserveTimes.filter((rt) => {
        if (!rt.id) return false;
        const initial = currentInitialSchedulesMap.get(rt.id);
        return (
          initial &&
          (initial.date !== rt.date || initial.start !== rt.start || initial.end !== rt.end)
        );
      });
      const schedulesToAdd = [
        ...reserveTimes.filter((rt) => rt.date && rt.start && rt.end && !rt.id),
        ...changedSchedules,
      ].map((rt) => ({
        date: rt.date,
        startTime: rt.start,
        endTime: rt.end,
      }));
      const changedScheduleIds = changedSchedules.map((rt) => rt.id!);
      const finalScheduleIdsToRemove = [...scheduleIdsToRemove, ...changedScheduleIds];

      const updateData = {
        title: data.title,
        category: data.category,
        description: data.description,
        price: numericPrice,
        address: data.address,
        bannerImageUrl: finalBannerUrl,
        subImageIdsToRemove: removedSubImageIds,
        subImageUrlsToAdd,
        scheduleIdsToRemove: finalScheduleIdsToRemove,
        schedulesToAdd,
      };
      await updateExperience(experienceId, updateData);

      setModalOpen(true);
    } catch (error: unknown) {
      showToastError(error, { fallback: '수정에 실패했습니다. 다시 시도해 주세요.' });
      setIsSubmitting(false);
    }
  };

  // 뒤로가기 핸들러
  const handleBackClick = useCallback(() => {
    if (hasChanged()) {
      setPendingAction(() => () => router.back());
      setLeaveModalOpen(true);
    } else {
      router.back();
    }
  }, [hasChanged, router]);

  // popstate(뒤로가기 등) 이벤트 감지
  useEffect(() => {
    const handleRouteChange = () => {
      if (hasChanged()) {
        setPendingAction(() => () => {
          router.back();
        });
        setLeaveModalOpen(true);
        window.history.pushState(null, '', pathname);
        return false;
      }
      setRouteLoading(true);
      return true;
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChanged, pathname]);

  // 나가기 모달 "네" 클릭 핸들러
  const handleLeave = useCallback(() => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setLeaveModalOpen(false);
  }, [pendingAction]);

  // 이미지 핸들러
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 이미지 확장자 체크
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/svg+xml',
    ];
    if (!validTypes.includes(file.type)) {
      showToastError('이미지 파일(jpg, png, gif, webp, bmp, svg)만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }
    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleIntroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (introPreviews.length + files.length > 4) return;

    // 이미지 확장자 체크
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/svg+xml',
    ];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        showToastError('이미지 파일(jpg, png, gif, webp, bmp, svg)만 업로드할 수 있습니다.');
        e.target.value = '';
        return;
      }
    }

    // 새 파일들의 미리보기 URL 생성
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    // URL과 파일을 매핑
    const newMap = new Map(imageUrlMap);
    files.forEach((file, index) => {
      newMap.set(newPreviews[index], file);
    });
    setImageUrlMap(newMap);

    // 미리보기에 추가
    setIntroPreviews((prev) => [...prev, ...newPreviews].slice(0, 4));
  };

  const handleRemoveIntro = (idx: number) => {
    const removedUrl = introPreviews[idx];

    // blob URL인 경우 메모리 해제 및 매핑에서 제거
    if (removedUrl && removedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(removedUrl);
      const newMap = new Map(imageUrlMap);
      newMap.delete(removedUrl);
      setImageUrlMap(newMap);
    }

    // 미리보기에서 제거
    setIntroPreviews(introPreviews.filter((_, i) => i !== idx));
  };

  // 로딩 상태 (데이터 or 라우터)
  if (loading || routeLoading) {
    return (
      <LoadingPage message={loading ? '체험 정보를 불러오는 중...' : '페이지를 이동 중입니다...'} />
    );
  }

  // 본인 아님
  if (!isOwner) {
    return (
      <div className='flex h-screen flex-col items-center justify-center'>
        <div className='text-16-m mb-16 text-red-500'>본인만 체험을 수정할 수 있습니다.</div>
        <button
          onClick={() => router.back()}
          className='bg-primary-500 rounded-lg px-24 py-8 text-white'
        >
          돌아가기
        </button>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className='flex h-screen flex-col items-center justify-center'>
        <div className='text-16-m mb-4 text-red-500'>{error}</div>
        <button
          onClick={() => router.back()}
          className='bg-primary-500 rounded-lg px-6 py-2 text-white'
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center'>
      <form
        className='flex w-375 flex-col px-24 py-30 md:w-744 md:px-30 md:pt-40 md:pb-53 lg:w-700 lg:px-0 lg:pb-102'
        onSubmit={rhfHandleSubmit(handleSubmit)}
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
          <h2 className='text-18-b'>내 체험 수정</h2>
        </div>

        <TitleInput<FormValues>
          register={register}
          error={errors.title?.message}
          value={watchedTitle || ''}
        />
        <CategoryInput
          value={watchedCategory || ''}
          onChange={(v) => setValue('category', v)}
          options={categoryOptions}
          error={errors.category?.message}
        />
        <DescriptionInput<FormValues>
          register={register}
          error={errors.description?.message}
          value={watchedDesc || ''}
        />
        <PriceInput
          value={watchedPrice || ''}
          error={errors.price?.message}
          register={register}
          setValue={setValue}
          path='price'
        />
        <AddressInput
          error={errors.address?.message}
          value={watchedAddress || ''}
          onChange={(v) => setValue('address', v)}
          // detailAddress={watch('detailAddress') || ''}
          // onDetailAddressChange={(v) => setValue('detailAddress', v)}
          // detailError={errors.detailAddress?.message}
        />
        <ReserveTimesInput value={reserveTimes} onChange={setReserveTimes} isEdit={true} />
        <BannerImageInput
          bannerPreview={bannerPreview}
          onChange={handleBannerChange}
          onRemove={() => {
            setBanner(null);
            setBannerPreview(null);
          }}
          banner={banner}
          isEdit={true}
        />
        <IntroImagesInput
          introPreviews={introPreviews}
          onChange={handleIntroChange}
          onRemove={handleRemoveIntro}
        />

        {/* 수정 버튼 */}
        <div className='flex justify-center'>
          <button
            type='submit'
            disabled={isSubmitting}
            className={`text-14-b h-41 w-120 rounded-xl py-12 text-white ${
              isSubmitting ? 'cursor-not-allowed bg-gray-400' : 'bg-primary-500'
            }`}
          >
            {isSubmitting ? '수정 중...' : '수정하기'}
          </button>
        </div>
      </form>

      {/* 수정 완료 모달 */}
      <ConfirmModal
        message='수정이 완료되었습니다.'
        isOpen={modalOpen}
        onClose={() => {
          setIsSubmitting(false);
          router.push('/profile/myExperiences');
        }}
      />

      {/* 나가기 확인 모달 */}
      <CommonModal
        open={leaveModalOpen}
        icon={
          <Image
            src='/icons/icon_alert_cancel.svg'
            alt='경고'
            width={24}
            height={24}
            className='size-full'
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

export default ExperienceEditPage;
