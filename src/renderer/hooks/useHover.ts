import { useRef, useState, useEffect } from "react";
import { HOVER_DELAY, HOVER_TIMEOUT } from "@/constants";

type UseHoverProps = {
  delay?: number;
  timeout?: number;
};

type UseHover = {
  isHover: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function useHover(params?: UseHoverProps): UseHover {
  const { delay, timeout } = params || {
    delay: HOVER_DELAY,
    timeout: HOVER_TIMEOUT,
  };
  const enterTimer = useRef(null);
  const exitTimer = useRef(null);
  const [isHover, setHover] = useState(false);

  useEffect(() => {
    return () => {
      clearTimeout(enterTimer.current);
      clearTimeout(exitTimer.current);
    };
  }, []);

  function onMouseEnter() {
    clearTimeout(exitTimer.current);
    enterTimer.current = setTimeout(() => setHover(true), delay);
  }

  function onMouseLeave() {
    clearTimeout(enterTimer.current);
    exitTimer.current = setTimeout(() => setHover(false), timeout);
  }

  return {
    isHover,
    onMouseEnter,
    onMouseLeave,
  };
}
