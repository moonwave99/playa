import React, { useEffect, useRef } from 'react';

const SCROLL_IDLE_TIMEOUT = 100;

export default function useScroll(onScroll: (scrolling: boolean) => void): {
  ref: React.RefObject<HTMLDivElement>;
} {
  const ref = useRef<HTMLDivElement>(null);
  const handlerRef = useRef(null);
  useEffect(() => {
    const onScrollHandler = (): void => {
      onScroll(true);
      if (handlerRef.current) {
        window.clearTimeout(handlerRef.current);
      }
      handlerRef.current = setTimeout((): void => onScroll(false), SCROLL_IDLE_TIMEOUT);
    };
    ref.current.addEventListener('scroll', onScrollHandler);
    return (): void => ref.current.removeEventListener('scroll', onScrollHandler);
  }, []);

  return { ref };
}