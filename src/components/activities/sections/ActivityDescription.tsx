'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import Image from 'next/image';

interface ActivityDescriptionProps {
  text: string;
}

const MAX_HEIGHT = 300;

const ActivityDescription = ({ text }: ActivityDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const measureRef = useRef<HTMLDivElement>(null);

  const checkTextHeight = useCallback(() => {
    if (!measureRef.current) return;
    const height = measureRef.current.scrollHeight;
    setIsOverflowing(height > MAX_HEIGHT);
  }, []);

  useEffect(() => {
    checkTextHeight(); // 바로 측정
  }, [text, checkTextHeight]);

  useEffect(() => {
    if (!measureRef.current) return;
    const observer = new ResizeObserver(() => {
      checkTextHeight();
    });
    observer.observe(measureRef.current);
    return () => observer.disconnect();
  }, [checkTextHeight]);

  return (
    <section className='flex flex-col gap-8 border-b-1 border-gray-100 pb-30'>
      <h2 className='text-18-b text-gray-950'>체험 설명</h2>
      <div
        ref={measureRef}
        className={clsx(
          'relative',
          isOverflowing && !isExpanded && 'max-h-[18.75rem] overflow-hidden',
        )}
      >
        <p className='text-16-body-m whitespace-pre-line text-gray-950'>{text}</p>
        {isOverflowing && !isExpanded && (
          <div className='absolute right-0 bottom-0 left-0 h-120 w-full bg-gradient-to-t from-white to-transparent' />
        )}
      </div>
      {isOverflowing && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className='border-primary-500 text-14-m flex h-50 w-135 items-center justify-center self-center rounded-2xl border-1'
        >
          {!isExpanded ? '더보기' : '간략히'}
          <Image
            src={!isExpanded ? '/icons/icon_alt arrow_down.svg' : '/icons/icon_alt arrow_up.svg'}
            alt={!isExpanded ? '더보기' : '간략히'}
            width={24}
            height={24}
          />
        </button>
      )}
    </section>
  );
};

export default ActivityDescription;
