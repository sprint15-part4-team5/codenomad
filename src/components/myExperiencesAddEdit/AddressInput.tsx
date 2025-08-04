'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Input from '@/components/common/Input';
// import { FieldValues, Path } from 'react-hook-form';
import type { AddressInputProps } from './MyExperiences';

// 다음 우편번호 서비스 타입 정의
interface DaumPostcode {
  open: () => void;
  embed: (element: HTMLElement) => void;
  close?: () => void;
}

interface PostcodeData {
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  sido: string;
  sigungu: string;
  roadname: string;
  buildingName: string;
}

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: PostcodeData) => void;
        onclose?: () => void;
      }) => DaumPostcode;
    };
  }
}

const AddressInput = ({
  error,
  value,
  onChange,
  // detailAddress = '',
  // onDetailAddressChange,
  // detailError,
}: AddressInputProps) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // 다음 우편번호 서비스 스크립트 로드
  useEffect(() => {
    // 이미 로드된 스크립트가 있는지 확인
    const existingScript = document.querySelector(
      'script[src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"]',
    );
    if (existingScript) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Daum 우편번호 서비스 스크립트 로드 실패');
    };

    scriptRef.current = script;
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  // 주소 검색 모달 열기
  const handleAddressSearch = () => {
    if (!isScriptLoaded || !window.daum) {
      return; // 스크립트가 로딩되지 않았으면 아무것도 하지 않음
    }
    setIsModalOpen(true);
  };

  // 주소 검색 완료 처리
  const handleAddressComplete = useCallback(
    (data: PostcodeData) => {
      if (typeof onChange !== 'function') {
        alert('AddressInput에 onChange prop이 전달되지 않았습니다.');
        setIsModalOpen(false);
        return;
      }
      onChange(data.roadAddress); // 선택된 주소를 상위로 전달
      setIsModalOpen(false);
    },
    [onChange],
  );

  // embed 방식으로 Daum 우편번호 서비스 실행
  useEffect(() => {
    if (isModalOpen && isScriptLoaded && window.daum) {
      const postcode = new window.daum.Postcode({
        oncomplete: handleAddressComplete,
        onclose: () => {
          setIsModalOpen(false);
        },
      });

      // 모달 내부에 우편번호 서비스 임베드
      const element = document.getElementById('postcode-container');
      if (element) {
        postcode.embed(element);
      }
    }
  }, [isModalOpen, isScriptLoaded, handleAddressComplete]);

  return (
    <div className='mb-30'>
      <div className='text-16-b flex pb-10'>
        <label htmlFor='address-input' className='cursor-pointer'>
          주소
        </label>
      </div>
      <Input
        id='address-input'
        placeholder={isScriptLoaded ? '주소를 입력해 주세요' : '주소 검색 서비스 로딩 중...'}
        value={value}
        readOnly
        onClick={isScriptLoaded ? handleAddressSearch : undefined}
        className={`${!isScriptLoaded ? 'cursor-not-allowed opacity-50' : ''}`}
        error={error}
        // register 제거, value/onChange만 사용
      />

      {/* 주소 검색 모달 - embed 방식 */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='rounded-18 shadow-custom-5 h-560 w-full max-w-500 overflow-hidden bg-white'>
            <div className='flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4'>
              <h3 className='text-16-b md:text-18-b font-semibold'>주소 검색</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className='text-gray-500 transition-colors hover:text-gray-700'
              >
                <Image src='/icons/icon_delete.svg' alt='닫기' width={24} height={24} />
              </button>
            </div>
            <div id='postcode-container' className='h-[calc(100%-60px)] w-full overflow-auto' />
          </div>
        </div>
      )}

      {/* 상세주소 입력 - 선택사항 
      {value && (
        <div className='mt-8'>
          <label className='text-16-b block pb-10'>상세주소</label>
          <input
            type='text'
            placeholder='상세주소를 입력해 주세요 (선택사항)'
            value={detailAddress}
            onChange={(e) => onDetailAddressChange?.(e.target.value)}
            className='shadow-custom-5 text-16-m focus:outline-primary-500 w-full rounded-2xl border-none bg-white px-20 py-16 text-gray-950 outline-1 outline-offset-[-1px] outline-gray-200 transition-all duration-150 placeholder:text-gray-400 focus:outline-[1.5px]'
          />
          {detailError && <div className='text-12-m mt-2 text-red-500'>{detailError}</div>}
        </div>
      )}
      */}
    </div>
  );
};

export default AddressInput;
