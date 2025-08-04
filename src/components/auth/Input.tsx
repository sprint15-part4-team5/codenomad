'use client';

import { useState, forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import Image from 'next/image';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | ReactNode;
  error?: string;
  className?: string;
  labelClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', labelClassName = '', type = 'text', ...rest }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (show ? 'text' : 'password') : type;

    const baseOutline = 'outline outline-1 outline-offset-[-1px] transition-all duration-150';
    const outlineColor = error
      ? 'outline-red'
      : 'focus-within:outline-primary-500 focus-within:outline-[1.5px] outline-gray-200';

    return (
      <div className={`flex w-full flex-col items-start ${className}`}>
        {label && <label className={`pb-10 ${labelClassName}`}>{label}</label>}

        <div
          className={`shadow-custom-5 flex w-full items-center justify-between rounded-[16px] bg-white px-20 py-16 ${baseOutline} ${outlineColor}`}
        >
          <div className='relative flex w-full items-center'>
            <input
              ref={ref}
              type={inputType}
              className='text-16-m flex-1 border-none bg-transparent text-gray-950 outline-none placeholder:text-gray-400'
              onKeyDown={(e) => {
                if ((type === 'password' || type === 'email') && e.key === ' ') {
                  e.preventDefault();
                }
              }}
              {...rest}
            />

            {isPassword && (
              <div className='ml-8 flex items-center justify-center'>
                <Image
                  src={show ? '/icons/icon_gray_eye_on.svg' : '/icons/icon_gray_eye_off.svg'}
                  alt='비밀번호 표시'
                  width={24}
                  height={24}
                  onClick={() => setShow((v) => !v)}
                  className='cursor-pointer'
                />
              </div>
            )}
          </div>
        </div>

        {error && <p className='text-12-m text-red mt-6 ml-8'>{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
