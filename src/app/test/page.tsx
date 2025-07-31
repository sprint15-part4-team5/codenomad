'use client';

import { useCallback } from 'react';
import showToastError from '@/lib/showToastError';
import axios from 'axios';
import { toast } from 'sonner';

const Page = () => {
  // 문자열 에러
  const triggerStringError = () => {
    showToastError('문자열 에러입니다.');
  };

  // 일반 JS 에러
  const triggerJsError = () => {
    showToastError(new Error('일반 JS 에러입니다.'));
  };

  // Axios 에러 (status: 404)
  const triggerAxios404Error = useCallback(async () => {
    try {
      await axios.get('/api/not-found-route');
    } catch (err) {
      showToastError(err, {
        fallback: '기본 오류 메시지',
        overrides: {
          404: '요청한 리소스를 찾을 수 없습니다.',
        },
      });
    }
  }, []);

  // Axios 에러 (status: 401) : 확인 결과 자체 서버가 없어서 404로 반환 되는 중
  const triggerAxios401Error = useCallback(async () => {
    try {
      await axios.get('/api/unauthorized');
    } catch (err) {
      showToastError(err, {
        fallback: '인증 오류 발생',
        overrides: {
          401: '로그인이 필요합니다.',
        },
      });
    }
  }, []);

  // undefined 등 이상한 값
  const triggerUnknownError = () => {
    showToastError(undefined);
  };

  return (
    <>
      <div className='flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 py-40'>
        <h1 className='text-18-b'>토스트 테스트</h1>
        <button
          className='text-16-b h-50 w-300 rounded-2xl border-2 border-gray-200 bg-green-400 text-gray-800'
          onClick={triggerStringError}
        >
          문자열 에러
        </button>
        <button
          className='text-16-b h-50 w-300 rounded-2xl border-2 border-gray-200 bg-yellow-400 text-gray-800'
          onClick={triggerJsError}
        >
          JS Error
        </button>
        <button
          className='text-16-b h-50 w-300 rounded-2xl border-2 border-gray-200 bg-red-400 text-gray-800'
          onClick={triggerAxios404Error}
        >
          Axios 404 에러
        </button>
        <button
          className='text-16-b h-50 w-300 rounded-2xl border-2 border-gray-200 bg-pink-400 text-gray-800'
          onClick={triggerAxios401Error}
        >
          Axios 401 에러
        </button>
        <button
          className='text-16-b h-50 w-300 rounded-2xl border-2 border-gray-200 bg-gray-400 text-gray-800'
          onClick={triggerUnknownError}
        >
          Unknown
        </button>
        <button
          className='text-16-b h-50 w-300 rounded-2xl border-2 border-gray-200 bg-green-400 text-gray-800'
          onClick={() => toast.success('성공')}
        >
          성공
        </button>
        <button
          className='text-16-b h-50 w-300 rounded-2xl border-2 border-gray-200 bg-red-400 text-gray-800'
          onClick={() => toast.error('실패')}
        >
          실패
        </button>
        <button
          className='text-16-b h-50 w-300 rounded-2xl border-2 border-gray-200 bg-orange-400 text-gray-800'
          onClick={() => toast.warning('경고')}
        >
          경고
        </button>
        <button
          className='text-16-b h-50 w-300 rounded-2xl border-2 border-gray-200 bg-blue-400 text-gray-800'
          onClick={() => toast.info('정보')}
        >
          정보
        </button>
      </div>

      <div className='flex flex-col items-center justify-center gap-8'></div>
    </>
  );
};

export default Page;
