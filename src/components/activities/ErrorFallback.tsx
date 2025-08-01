import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import showToastError from '@/lib/showToastError';

const ErrorFallback = () => {
  const [errorCount, setErrorCount] = useState<number>(1);
  const router = useRouter();

  const handleClick = (): void => {
    setErrorCount((prv) => prv + 1);
    router.refresh();
    showToastError(`연결 실패 재시도... ${errorCount}회`);

    if (errorCount === 3) {
      showToastError('서버와의 연결이 불안정 합니다 잠시후 다시 시도해주세요');
      router.push('/');
    }
  };
  return (
    <>
      <div className='flex h-[90vh] flex-col items-center justify-center gap-24'>
        <div className='relative size-300'>
          <Image alt='에러 이미지' src={'/icons/404_kkot.svg'} fill />
        </div>
        <h1 className='text-14-b md:text-18-b text-center text-gray-500'>
          데이터를 불러오는데 실패하였습니다. <br />
          다시 시도해주세요.
        </h1>
        <button
          className='bg-primary-500 text-14-m h-50 w-250 self-center rounded-2xl text-white md:w-300'
          onClick={handleClick}
        >
          다시 시도
        </button>
      </div>
    </>
  );
};

export default ErrorFallback;
