'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

const ConfirmModal = ({ message, isOpen, onClose }: ConfirmModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='shadow-custom-5 flex w-320 flex-col items-center rounded-[1.25rem] bg-white px-24 py-24 text-center sm:w-400'>
        <p className='text-16-b mb-20 break-keep text-black'>{message}</p>
        <button
          onClick={onClose}
          className='bg-primary-500 text-16-m h-44 w-200 rounded-[1.25rem] text-white'
        >
          확인
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
