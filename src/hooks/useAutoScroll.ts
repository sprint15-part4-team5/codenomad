'use client';

import { useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  getScrollStep: () => number;
  delay: number;
}

export const useAutoScroll = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  { getScrollStep, delay = 2000 }: UseAutoScrollOptions,
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAmountRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollStep = getScrollStep();

    const startScroll = () => {
      if (intervalRef.current) return;

      intervalRef.current = setInterval(() => {
        scrollAmountRef.current += scrollStep;

        if (scrollAmountRef.current >= container.scrollWidth - container.clientWidth) {
          scrollAmountRef.current = 0;
        }

        container.scrollTo({
          left: scrollAmountRef.current,
          behavior: 'smooth',
        });
      }, delay);
    };

    const stopScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const syncScrollPosition = () => {
      scrollAmountRef.current = container.scrollLeft;
    };

    const handlePointerDown = () => stopScroll();
    const handlePointerUp = () => {
      syncScrollPosition();
      startScroll();
    };

    const handleMouseEnter = () => stopScroll();
    const handleMouseLeave = () => startScroll();

    startScroll();

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      stopScroll();
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerUp);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, getScrollStep, delay]);
};
