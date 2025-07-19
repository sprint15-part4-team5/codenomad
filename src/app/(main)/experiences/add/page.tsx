'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

const categoryOptions = [
  { value: '', label: '카테고리를 선택해 주세요' },
  { value: 'culture', label: '문화 · 예술' },
  { value: 'food', label: '식음료' },
  { value: 'sports', label: '스포츠' },
  { value: 'tour', label: '투어' },
  { value: 'sightseeing', label: '관광' },
  { value: 'wellbeing', label: '웰빙' },
];

interface ReserveTime {
  date: string;
  start: string;
  end: string;
}

const ExperienceAddPage = () => {
  // 입력값 상태
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [reserveTimes, setReserveTimes] = useState<ReserveTime[]>([
    { date: '', start: '', end: '' },
  ]);
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [introImages, setIntroImages] = useState<File[]>([]);
  const [introPreviews, setIntroPreviews] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 최초 입력값 저장
  const initialValues = useRef({
    title: '',
    category: '',
    desc: '',
    price: '',
    address: '',
    bannerPreview: null,
    introPreviews: [],
    reserveTimes: JSON.stringify([{ date: '', start: '', end: '' }]),
  });

  // 변경사항 비교
  const hasChanged = () => {
    if (isSubmitting) return false;
    return (
      title !== initialValues.current.title ||
      category !== initialValues.current.category ||
      desc !== initialValues.current.desc ||
      price !== initialValues.current.price ||
      address !== initialValues.current.address ||
      bannerPreview !== initialValues.current.bannerPreview ||
      JSON.stringify(introPreviews) !== JSON.stringify(initialValues.current.introPreviews) ||
      JSON.stringify(reserveTimes) !== initialValues.current.reserveTimes
    );
  };

  // 등록하기
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title ||
      !category ||
      !desc ||
      !price ||
      !address ||
      !banner ||
      reserveTimes.some((rt) => !rt.date || !rt.start || !rt.end) ||
      isDuplicateTime()
    ) {
      alert('필수 항목을 모두 입력해 주세요.\n또는 예약 시간이 중복되었습니다.');
      return;
    }
    setModalOpen(true);
  };

  // 뒤로가기
  const handleBackClick = () => {
    if (hasChanged()) {
      setPendingAction(() => () => router.back());
      setLeaveModalOpen(true);
    } else {
      router.back();
    }
  };

  // 새로고침/닫기/뒤로가기 경고
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasChanged()) {
        e.preventDefault();
        e.returnValue = '';
      }
    },
    [title, category, desc, price, address, bannerPreview, introPreviews, reserveTimes],
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
  const handleLeave = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setLeaveModalOpen(false);
  };

  // 등록 완료 모달 "확인" 클릭 시
  const handleConfirm = () => {
    setIsSubmitting(true); // 변경 감지 비활성화
    window.removeEventListener('beforeunload', handleBeforeUnload); // 경고창 제거
    router.push('/profile/myExperiences');
  };

  // 예약시간 중복 체크
  const isDuplicateTime = () => {
    const times = reserveTimes.map((rt) => `${rt.date}-${rt.start}-${rt.end}`);
    return new Set(times).size !== times.length;
  };

  return (
    <div className='flex items-center justify-center'>
      <form
        className='flex w-375 flex-col px-24 py-30 md:w-744 md:px-30 md:pt-40 md:pb-53 lg:w-700 lg:px-0 lg:pb-102'
        onSubmit={handleSubmit}
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
            <img src='/icons/icon_back.svg' alt='뒤로가기' width={24} height={24} />
          </button>
          <h2 className='text-18-b'>내 체험 등록</h2>
        </div>
        <TitleInput value={title} onChange={setTitle} />
        <CategoryInput value={category} onChange={setCategory} options={categoryOptions} />
        <DescriptionInput value={desc} onChange={setDesc} />
        <PriceInput value={price} onChange={setPrice} />
        <AddressInput value={address} onChange={setAddress} />
        <ReserveTimesInput
          reserveTimes={reserveTimes}
          onChange={(idx, key, value) =>
            setReserveTimes(
              reserveTimes.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
            )
          }
          onAdd={() => setReserveTimes([{ date: '', start: '', end: '' }, ...reserveTimes])}
          onRemove={(idx) => setReserveTimes(reserveTimes.filter((_, i) => i !== idx))}
          isDuplicateTime={isDuplicateTime}
        />
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
            className='bg-primary-500 text-14-b h-41 w-120 rounded-[12px] py-12 text-white'
          >
            등록하기
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
        icon={<img src='/icons/icon_alert.svg' alt='경고' className='h-full w-full' />}
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
