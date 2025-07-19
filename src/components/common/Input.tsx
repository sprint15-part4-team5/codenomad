'use client';

import {
  useState,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from 'react';
import Image from 'next/image';

// Input 컴포넌트 Props 타입 정의
type InputTypes = InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement> &
  SelectHTMLAttributes<HTMLSelectElement>;

interface InputProps extends InputTypes {
  label?: string | ReactNode; // string 또는 ReactNode
  hideLabelOnMobile?: boolean; // 모바일에서 라벨 숨김 여부
  hideLabelOnDesktop?: boolean; // 데스크탑에서 라벨 숨김 여부
  error?: string;
  className?: string;
  labelClassName?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: { value: string; label: ReactNode }[];
  dateIcon?: boolean;
  onDateIconClick?: () => void; // 추가
}

const Input = ({
  label = '',
  hideLabelOnMobile = false,
  hideLabelOnDesktop = false,
  error,
  className = '',
  labelClassName = '',
  type = 'text',
  as = 'input',
  options = [],
  dateIcon = false,
  onDateIconClick,
  ...props
}: InputProps) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  // outline 스타일 클래스
  const baseOutline = 'outline outline-1 outline-offset-[-1px] transition-all duration-150';
  const outlineColor = error
    ? 'outline-red'
    : 'focus-within:outline-primary-500 focus-within:outline-[1.5px] outline-gray-200';

  return (
    <div className={`flex flex-col items-start w-full ${className}`}>
      {/* 라벨 */}
      {label && (
        <label
          className={`
            pb-10 ${labelClassName}
            ${hideLabelOnMobile ? 'hidden md:block' : ''}
            ${hideLabelOnDesktop ? 'block md:hidden' : ''}
          `}
        >
          {label}
        </label>
      )}

      <div
        className={`w-full px-20 py-16 bg-white rounded-[16px] shadow-custom-5 flex justify-between items-center ${baseOutline} ${outlineColor} ${props.onClick ? 'cursor-pointer' : ''}`}
        {...(props.onClick && { onClick: props.onClick })}
      >
        {/* textarea 타입 */}
        {as === 'textarea' ? (
          <textarea
            className={`flex-1 border-none outline-none text-gray-950 text-16-m placeholder:text-gray-400 bg-transparent resize-none ${className}`}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : as === 'select' ? (
          // select 타입
          <div className='relative w-full'>
            <select
              className={`appearance-none w-full flex-1 border-none outline-none bg-transparent text-16-m
                ${props.value === '' ? 'text-gray-400' : 'text-gray-950'}`}
              {...(props as SelectHTMLAttributes<HTMLSelectElement>)}
            >
              {options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className={opt.value === '' ? 'text-gray-400' : 'text-gray-900'}
                  disabled={opt.value === ''}
                  hidden={opt.value === ''}
                >
                  {opt.label}
                </option>
              ))}
            </select>
            {/* 드롭다운 아이콘 */}
            <span className='pointer-events-none absolute right-0 top-1/2 -translate-y-1/2'>
              <Image src='/icons/icon_alt arrow_down.svg' alt='드롭다운' width={24} height={24} />
            </span>
          </div>
        ) : (
          // 기본 input 타입
          <>
            <input
              type={inputType}
              className='flex-1 border-none outline-none text-gray-950 text-16-m placeholder:text-gray-400 bg-transparent'
              placeholder={props.placeholder}
              value={props.value as string}
              onChange={props.onChange}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              disabled={props.disabled}
              readOnly={props.readOnly}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
            {dateIcon && (
              <button
                type='button'
                className='absolute right-20 top-50 cursor-pointer'
                tabIndex={-1}
                onClick={onDateIconClick}
              >
                <img src='/icons/icon_calendar.svg' alt='달력' width={24} height={24} />
              </button>
            )}
            {/* 비밀번호 보기/숨기기 토글 */}
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
          </>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && <p className='mt-6 ml-8 text-12-m text-red'>{error}</p>}
    </div>
  );
};

export default Input;
