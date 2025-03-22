import { useState } from "react";
import { useKeyManager, withPrevent } from "./useKeyboardManager";

type UseKeyboardNavigableParams<T> = {
  items: T[];
  context: string;
  columns: number;
  onBackspace?: (items: T[]) => void;
  onEnter?: (item: T, event: KeyboardEvent) => void;
  onUp?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
}

type UseKeyboardNavigable = {
  currentIndex: number;
}

export default function useKeyboardNavigable<T>({ items, context, columns = 1, onBackspace, onEnter, onUp, onLeft, onRight }: UseKeyboardNavigableParams<T>): UseKeyboardNavigable {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [selection, setSelection] = useState<number[]>([]);
  useKeyManager({
    context,
    handlers: {
      ArrowUp: withPrevent((event: KeyboardEvent) => {
        if (currentIndex === 0 && onUp) {
          onUp();
          return;
        }
        if (event.metaKey) {
          setCurrentIndex(0);
          return;
        }

        setCurrentIndex((prev) =>
          prev === -1 ? 0 : Math.max(0, prev - columns)
        );
      }),
      ArrowDown: withPrevent((event: KeyboardEvent) => {
        if (event.metaKey) {
          setCurrentIndex(items.length - 1);
          return;
        }
        setCurrentIndex((prev) =>
          prev === -1 ? 0 : Math.min(items.length - 1, prev + columns)
        );
      }),
      ArrowLeft: withPrevent(() => {
        if ((columns === 1 || currentIndex == 0) && onLeft) {
          setCurrentIndex(-1);
          onLeft();
          return;
        }
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }),
      ArrowRight: withPrevent(() => {
        if (columns === 1 && onRight) {
          onRight();
          return;
        }
        setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1));
      }),
      Enter: (event: KeyboardEvent) =>
        onEnter && onEnter(items[currentIndex], event),
      Backspace: () => {
        if (!onBackspace) {
          return;
        }
        onBackspace(selection.map((index) => items[index]));
        setSelection([]);
      },
      " ": withPrevent(() => void (0)),
    },
  });

  return { currentIndex };
}