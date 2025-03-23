import { useEffect, useRef } from "react";

export default function useClickOutside(callback: () => void) {
  const ref = useRef(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const clickedInside = (ref.current as unknown as HTMLElement)?.contains(event.target as HTMLElement);
      if (clickedInside) {
        return;
      }
      callback();
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [callback])

  return ref;
}