import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface TimeDropdownOption {
  value: string;
  label: string;
}

interface TimeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: TimeDropdownOption[];
  placeholder?: string;
  error?: string;
  label?: string;
  className?: string;
}

const TimeDropdown = ({
  value,
  onChange,
  options,
  placeholder = '시간 선택',
  error,
  label,
  className = '',
}: TimeDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selected = options.find((opt) => opt.value === value);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <span className='text-16-b flex pb-10'>{label}</span>}
      <button
        type='button'
        className={`shadow-custom-5 flex h-54 w-124.5 items-center rounded-2xl bg-white px-20 py-16 outline-1 outline-offset-[-1px] ${
          error ? 'outline-red border-red' : 'focus:outline-primary-500 outline-gray-100'
        } ${!selected ? 'text-gray-400' : 'text-gray-900'} md:w-122`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup='listbox'
        aria-label={label || '시간 선택'}
      >
        <span
          className={`text-16-m w-full truncate text-left ${!selected ? 'text-gray-400' : 'text-gray-900'}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <span className='flex items-center'>
          <Image
            src='/icons/icon_alt arrow_down.svg'
            alt='dropdown arrow'
            width={24}
            height={24}
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {open && (
        <div
          className='absolute top-full left-0 z-10 mt-10 flex max-h-240 w-124.5 flex-col overflow-y-auto rounded-2xl bg-white p-12 outline-1 outline-offset-[-1px] outline-gray-100 md:w-122'
          role='listbox'
          aria-label='시간 옵션 목록'
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type='button'
              className={`flex h-48 w-full items-center justify-between self-stretch rounded-xl px-20 py-16 ${
                value === opt.value ? 'bg-sky-100' : ''
              } focus:ring-primary-500 hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:outline-none`}
              onClick={() => handleSelect(opt.value)}
              role='option'
              aria-selected={value === opt.value}
              tabIndex={0}
            >
              <span className='justify-center text-base font-medium text-gray-900'>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      )}
      {error && <div className='text-12-m mt-2 text-red-500'>{error}</div>}
    </div>
  );
};

export default TimeDropdown;
