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
        className={`shadow-custom-5 flex h-54 w-124.5 items-center rounded-2xl bg-white px-20 py-16 outline-1 outline-offset-[-1px] outline-gray-100 md:w-122 ${!selected ? 'text-gray-400' : 'text-gray-900'} ${error ? 'outline-red' : 'focus:outline-primary-500'}`}
        onClick={() => setOpen((v) => !v)}
        style={{
          border: error ? '1.5px solid #EF4444' : '',
          color: !selected ? '#A3A3A3' : '#171717',
        }}
      >
        <span
          className={`text-16-m w-full truncate text-left ${!selected ? 'text-gray-400' : 'text-gray-900'}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <span className='flex items-center'>
          <Image src='/icons/icon_alt arrow_down.svg' alt='dropdown arrow' width={24} height={24} />
        </span>
      </button>
      {open && (
        <div className='absolute top-full left-0 z-10 mt-10 flex max-h-240 w-124.5 flex-col overflow-y-auto rounded-2xl bg-white p-12 outline-1 outline-offset-[-1px] outline-gray-100 md:w-122'>
          {options.map((opt) => (
            <button
              key={opt.value}
              type='button'
              className={`flex h-48 w-92 items-center justify-between self-stretch rounded-xl px-20 py-16 md:w-98 lg:w-98 ${value === opt.value ? 'bg-sky-100' : ''} hover:bg-gray-50`}
              onClick={() => handleSelect(opt.value)}
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
