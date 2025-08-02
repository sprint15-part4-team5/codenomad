'use client';

import Image from 'next/image';
import clsx from 'clsx';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CATEGORY_LIST = [
  { label: '문화 · 예술', icon: '/icons/icon_art.svg' },
  { label: '식음료', icon: '/icons/icon_food.svg' },
  { label: '스포츠', icon: '/icons/icon_sport.svg' },
  { label: '투어', icon: '/icons/icon_tour.svg' },
  { label: '관광', icon: '/icons/icon_bus.svg' },
  { label: '웰빙', icon: '/icons/icon_wellbeing.svg' },
];

const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className='flex overflow-x-auto no-scrollbar sm:flex-wrap gap-8 cursor-pointer'>
      {CATEGORY_LIST.map(({ label, icon }) => {
        const isSelected = selectedCategory === label;

        return (
          <button
            key={label}
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(isSelected ? null : label)}
            className={clsx(
              'flex items-center shrink-0 px-12 py-6 rounded-full border transition-colors duration-200 cursor-pointer whitespace-nowrap',
              isSelected
                ? 'bg-[#333333] text-white border-primary text-14-m md:text-16-m hover:bg-[#2a2a2a]'
                : 'bg-white text-gray-950 border-gray-300 text-14-m md:text-16-m hover:bg-gray-100',
            )}
          >
            <Image
              src={icon}
              alt={`${label} 아이콘`}
              width={16}
              height={16}
              className={clsx('transition-all duration-200', isSelected && 'invert brightness-0')}
            />

            <span className='ml-4'>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
