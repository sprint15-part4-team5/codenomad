'use client';

import { ReactNode, RefObject } from 'react';
import cn from '@/utils/cn';

interface DraggableContainerProps {
  containerRef: RefObject<HTMLDivElement | null>;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: () => void;
  children: ReactNode;
  className?: string;
}

const DraggableContainer = ({
  containerRef,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  children,
  className,
}: DraggableContainerProps) => {
  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed bottom-0 left-0 z-50 w-full overscroll-none bg-white transition-transform duration-300',
        className,
      )}
      style={{
        touchAction: 'pan-y', // 세로 드래그만 허용, 새로고침 제스처 방지
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ✅ 시각적 드래그 핸들 */}
      <div className='flex w-full justify-center pb-20'>
        <div className='h-2 w-30 rounded-full bg-gray-300' />
      </div>

      {children}
    </div>
  );
};

export default DraggableContainer;
