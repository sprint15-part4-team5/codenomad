'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import Image from 'next/image';

interface SortDropdownProps {
  selectedSort: string | null;
  onSelectSort: (sort: string) => void;
}

const SORT_OPTIONS = [
  { label: '낮은 가격순', value: 'price_asc' },
  { label: '높은 가격순', value: 'price_desc' },
];

const PriceSortDropdown = ({ selectedSort, onSelectSort }: SortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabel = SORT_OPTIONS.find((opt) => opt.value === selectedSort)?.label || '가격';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className='text-14-m flex items-center gap-4 text-gray-700'
      >
        {selectedLabel}
        <Image
          src='/icons/icon_alt arrow_down.svg'
          alt='드롭다운 화살표'
          width={16}
          height={16}
          className={clsx('transition-transform', { 'rotate-180': isOpen })}
        />
      </button>

      {isOpen && (
        <ul className='absolute top-full right-1/2 z-10 mt-4 min-w-[5.625rem] translate-x-1/2 rounded-md border border-gray-200 bg-white whitespace-nowrap shadow-md sm:right-0 sm:translate-x-0'>
          {SORT_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                onClick={() => {
                  onSelectSort(option.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  'text-14-m w-full px-16 py-8 text-left transition-colors duration-150 hover:bg-gray-100',
                  selectedSort === option.value && 'text-primary font-semibold',
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PriceSortDropdown;
