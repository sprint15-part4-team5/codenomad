'use client';

import { useState, useRef, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';

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

const ExperienceEditPage = () => {
  // 입력값 상태
  const [title, setTitle] = useState('mr.Wonkyu와 함께하는 그림교실');
  const [category, setCategory] = useState('culture');
  const [desc, setDesc] = useState('안녕하세요! 저희 프리드로잉 백드롭페인팅 체험을 소개합니다...');
  const [price, setPrice] = useState('34,900원');
  const [address, setAddress] = useState('연남동244-22, 프리드로잉');
  const [reserveTimes, setReserveTimes] = useState<ReserveTime[]>([
    { date: '', start: '', end: '' },
    { date: '22/11/04', start: '12:00', end: '15:00' },
    { date: '22/11/14', start: '12:00', end: '15:00' },
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
    title,
    category,
    desc,
    price,
    address,
    bannerPreview,
    introPreviews,
    reserveTimes: JSON.stringify(reserveTimes),
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

  // 수정하기
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title ||
      !category ||
      !desc ||
      !price ||
      !address ||
      !bannerPreview ||
      reserveTimes.some((rt) => !rt.date || !rt.start || !rt.end) ||
      isDuplicateTime()
    ) {
      alert('필수 항목을 모두 입력해 주세요.\n(중복된 예약 시간대도 확인)');
      return;
    }
    setIsSubmitting(true); // 수정 완료 후 경고 비활성화
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
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanged()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [
    title,
    category,
    desc,
    price,
    address,
    bannerPreview,
    introPreviews,
    reserveTimes,
    isSubmitting,
  ]);

  // 모달 "네" 클릭
  const handleLeave = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setLeaveModalOpen(false);
  };

  // 예약시간 중복 체크
  const isDuplicateTime = () => {
    const times = reserveTimes.map((rt) => `${rt.date}-${rt.start}-${rt.end}`);
    return new Set(times).size !== times.length;
  };

  // 이미지 핸들러
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };
  const handleIntroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (introImages.length + files.length > 4) return;
    setIntroImages((prev) => [...prev, ...files].slice(0, 4));
    setIntroPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, 4));
  };
  const handleRemoveIntro = (idx: number) => {
    setIntroImages(introImages.filter((_, i) => i !== idx));
    setIntroPreviews(introPreviews.filter((_, i) => i !== idx));
  };

  return (
    <div className='flex justify-center items-center'>
      <form
        className='w-375 md:w-744 lg:w-700 px-24 md:px-30 lg:px-0 py-30 md:pt-40 md:pb-53 lg:pb-102 flex flex-col'
        onSubmit={handleSubmit}
        autoComplete='off'
      >
        {/* 뒤로가기 */}
        <div className='flex items-center mb-24'>
          <button
            type='button'
            className='mr-8 md:hidden'
            onClick={handleBackClick}
            aria-label='뒤로가기'
          >
            <img src='/icons/icon_back.svg' alt='뒤로가기' width={24} height={24} />
          </button>
          <h2 className='text-18-b'>내 체험 수정</h2>
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
          onAdd={() => setReserveTimes([...reserveTimes, { date: '', start: '', end: '' }])}
          onRemove={(idx) => setReserveTimes(reserveTimes.filter((_, i) => i !== idx))}
          isDuplicateTime={isDuplicateTime}
        />
        <BannerImageInput
          bannerPreview={bannerPreview}
          onChange={handleBannerChange}
          onRemove={() => {
            setBanner(null);
            setBannerPreview(null);
          }}
          banner={banner}
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
            className='w-120 h-41 py-12 bg-primary-500 text-white text-14-b rounded-[12px]'
          >
            수정하기
          </button>
        </div>
      </form>
      {/* 수정 완료 모달 */}
      <ConfirmModal
        message='수정이 완료되었습니다.'
        isOpen={modalOpen}
        onClose={() => {
          setIsSubmitting(true); // 이동 전 경고 비활성화
          router.push('/profile/myExperiences');
        }}
      />
      {/* 나가기 확인 모달 */}
      <CommonModal
        open={leaveModalOpen}
        icon={<img src='/icons/icon_alert.svg' alt='경고' className='w-full h-full' />}
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
