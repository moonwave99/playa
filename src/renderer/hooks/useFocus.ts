import { useEffect, useRef } from "react";

export function useFocus(focusOnMount = false) {
  const ref = useRef(null);

  const focus = () => ref.current?.focus();

  useEffect(() => {
    if (!focusOnMount) {
      return;
    }
    setTimeout(focus, 10);
  }, [focusOnMount]);

  return {
    ref,
    focus,
  };
}
