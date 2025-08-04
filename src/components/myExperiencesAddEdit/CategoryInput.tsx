import { useState, useRef, useEffect, useId } from 'react';
import Image from 'next/image';
import type { CategoryInputProps } from './MyExperiences';

const CategoryInput = ({ value, onChange, options, error }: CategoryInputProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const categoryId = useId(); // 고유 ID 생성

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selected = options.find((opt) => opt.value === value);

  const handleCategorySelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <div className='relative mb-24' ref={ref}>
      <div className='text-16-b flex pb-10'>
        <span className='cursor-pointer' onClick={() => setOpen((v) => !v)}>
          카테고리
        </span>
      </div>
      <button
        id={categoryId}
        type='button'
        className='shadow-custom-5 flex h-54 w-327 items-center justify-between rounded-2xl bg-white px-20 py-16 outline-1 outline-offset-[-1px] outline-gray-100 md:w-684 lg:w-700'
        onClick={() => {
          setOpen((v) => !v);
        }}
      >
        <span className={`text-16-m ${selected && value ? 'text-gray-900' : 'text-gray-400'}`}>
          {selected ? selected.label : '카테고리를 선택해 주세요'}
        </span>
        <Image src='/icons/icon_alt arrow_down.svg' alt='dropdown arrow' width={24} height={24} />
      </button>
      {open && (
        <div className='absolute top-full left-0 z-10 mt-10 flex w-327 flex-col gap-4 rounded-2xl bg-white p-12 outline-1 outline-offset-[-1px] outline-gray-100 md:w-684 md:p-12 lg:w-700'>
          {options.map((opt) => (
            <button
              key={opt.value}
              type='button'
              className={`flex h-48 w-303 items-center justify-between self-stretch rounded-xl px-20 py-16 md:w-660 lg:w-676 ${value === opt.value ? 'bg-sky-100' : ''} hover:bg-gray-50`}
              onClick={() => handleCategorySelect(opt.value)}
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

export default CategoryInput;
