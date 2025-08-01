/**
 * 공통 모달 컴포넌트
 * - open: 모달 표시 여부
 * - icon: 상단 아이콘(이미지 등)
 * - text: 안내/경고 텍스트 (줄바꿈은 <br />)
 * - cancelText, confirmText: 버튼 텍스트
 * - onCancel, onConfirm: 버튼 클릭 핸들러
 */
interface CommonModalProps {
  open: boolean;
  icon?: React.ReactNode;
  text: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const CommonModal = ({
  open,
  icon,
  text,
  cancelText = '아니오',
  confirmText = '취소하기',
  onCancel,
  onConfirm,
}: CommonModalProps) => {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='shadow-custom-5 flex h-216 w-320 flex-col items-center justify-center rounded-3xl bg-white px-43 pt-30 pb-24 md:h-285 md:w-400 md:rounded-[1.875rem] md:px-59 md:py-30'>
        {/* 아이콘: 모바일 49x49, 테블릿 88x88 */}
        {icon && (
          <div className='mb-2 flex items-center justify-center'>
            <span className='flex size-49 items-center justify-center md:size-88'>{icon}</span>
          </div>
        )}
        {/* 텍스트: <br />로 줄바꿈 */}
        <div
          className='text-18-body-b md:text-20-body-b mb-20 text-center md:mb-24'
          dangerouslySetInnerHTML={{ __html: text }}
        />
        {/* 버튼 */}
        <div className='flex w-full justify-center gap-8 md:gap-12'>
          <button
            type='button'
            className='text-14-m md:text-16-m h-41 flex-1 rounded-xl border border-gray-200 bg-white text-gray-600 md:h-47 md:rounded-[0.875rem]'
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type='button'
            className='bg-primary-500 text-14-b md:text-16-m h-41 flex-1 rounded-xl text-white md:h-47 md:rounded-[0.875rem]'
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonModal;
