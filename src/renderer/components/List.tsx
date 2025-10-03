import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
} from "react";
import type { MouseEvent, ReactNode, Ref } from "react";
import {
  useVirtualizer,
  type ScrollToOptions,
  VirtualItem,
} from "@tanstack/react-virtual";
import { useKeyManager, withPrevent } from "../hooks/useKeyboardManager";
import useResponsiveColumns from "../hooks/useResponsiveColumns";
import { useApi } from "../hooks/useApi";
import type { ColumnsConfigEntry } from "../hooks/useResponsiveColumns";
import type { HasId } from "@/types/types";

export type RenderParams<T> = {
  item: T;
  index: number;
  selected: boolean;
  hasFocus: boolean;
  selection: number[];
  onClick: (event: MouseEvent) => void;
};

export type ScrollInfo = {
  measurementsCache: VirtualItem[];
  scrollOffset: number;
};

export type ListKeyHandler<T> = (event: KeyboardEvent, selection: T[]) => void;

type ListProps<T> = {
  items: T[];
  onEnter?: (item: T, event: KeyboardEvent) => void;
  onBackspace?: (selection: T[], event: KeyboardEvent) => void;
  onSelect?: (item: T) => void;
  onUp?: () => void;
  onLeft?: (event: KeyboardEvent) => boolean | void;
  onRight?: (event: KeyboardEvent) => boolean | void;
  shouldCallOnLeft?: () => boolean;
  shouldCallOnRight?: () => boolean;
  onUnmount?: (scrollInfo: ScrollInfo) => void;
  context?: string;
  className?: string;
  columnsConfig?: ColumnsConfigEntry[];
  render: (params: RenderParams<T>) => ReactNode;
  estimateSize?: (
    columns: number,
    index: number
  ) => { width: number | string; height: number };
  gap?: number;
  paddingEnd?: number;
  paddingRight?: number;
  overscan?: number;
  disableMultipleSelection?: boolean;
  isInfinite?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  onSelectionChange?: (selection: number[]) => void;
  shouldPreventSpace?: boolean;
  initialSelection?: number[];
  scrollBehavior?: ScrollToOptions;
  keyHandlers?: Record<string, ListKeyHandler<T>>;
  ref?: Ref<{
    scrollToIndex: (index: number) => void;
  }>;
  scrollInfo?: ScrollInfo;
};

function defaultEstimateSize(columns: number) {
  const containerWidth = window.innerWidth;

  const width = containerWidth / columns;
  return {
    width,
    height: width * 1.25,
  };
}

export default function List<T>({
  onEnter,
  onBackspace,
  onSelect,
  onUp,
  onLeft,
  onRight,
  onUnmount,
  shouldCallOnLeft = () => true,
  shouldCallOnRight = () => true,
  items,
  context = "list",
  className,
  columnsConfig = [{ count: 1, width: 400 }],
  render,
  estimateSize = defaultEstimateSize,
  gap = 16,
  paddingEnd = 16,
  paddingRight = 16,
  overscan = 10,
  disableMultipleSelection,
  isInfinite = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  onSelectionChange,
  shouldPreventSpace,
  initialSelection = [],
  keyHandlers = {},
  scrollBehavior,
  ref,
  scrollInfo,
}: ListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialSelection.length) {
      return initialSelection[0];
    }
    return -1;
  });

  const [selection, setSelection] = useState<number[]>(initialSelection);

  const { columns } = useResponsiveColumns({
    config: columnsConfig,
    onResize: () => {
      virtualizer.measure();
      if (currentIndex === -1) {
        return;
      }
      virtualizer.scrollToIndex(currentIndex);
    },
  });

  useApi({
    onClearSelection: () => {
      setCurrentIndex(selection[0]);
      setSelection([]);
    },
  });

  useEffect(() => {
    return () => {
      if (!onUnmount) {
        return;
      }
      onUnmount({
        measurementsCache: virtualizer.measurementsCache,
        scrollOffset: virtualizer.scrollOffset,
      });
    };
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (onSelect) {
      onSelect(items[currentIndex]);
    }
    setSelection([currentIndex]);
  }, [currentIndex]);

  useLayoutEffect(() => {
    if (currentIndex === -1) {
      return;
    }
    virtualizer.scrollToIndex(currentIndex, scrollBehavior);
  }, [currentIndex, scrollBehavior]);

  useEffect(() => {
    if (!onSelectionChange) {
      return;
    }
    onSelectionChange(selection);
  }, [selection]);

  useImperativeHandle(ref, () => {
    return {
      scrollToIndex: (index: number) => {
        setCurrentIndex(index);
      },
    };
  }, []);

  const isVertical = columnsConfig.length === 1 && columns === 1;

  const horizontalHandlers = {
    ArrowLeft: (event: KeyboardEvent) => {
      if (
        (columns === 1 || currentIndex == 0) &&
        onLeft &&
        !event.metaKey &&
        shouldCallOnLeft()
      ) {
        if (onLeft(event)) {
          return;
        }
      }
      if (isVertical) {
        return;
      }
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    },
    ArrowRight: (event: KeyboardEvent) => {
      if (onRight && shouldCallOnRight()) {
        if (onRight(event)) {
          return;
        }
      }
      if (isVertical) {
        return;
      }
      setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1));
    },
  };

  const { currentContext, setContext } = useKeyManager({
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
      ...horizontalHandlers,
      Enter: (event: KeyboardEvent) =>
        items[currentIndex] && onEnter && onEnter(items[currentIndex], event),
      Backspace: (event: KeyboardEvent) => {
        if (!onBackspace || !selection.length) {
          return;
        }
        onBackspace(
          selection.map((index) => items[index]),
          event
        );
        setSelection([]);
      },
      " ": (event: KeyboardEvent) => {
        if (!shouldPreventSpace) {
          return;
        }
        if ((event.target as HTMLElement).tagName === "INPUT") {
          return;
        }
        event.preventDefault();
      },
      ...Object.entries(keyHandlers).reduce(
        (memo, [key, handler]) => ({
          ...memo,
          [key]: (event: KeyboardEvent) =>
            handler(
              event,
              selection.map((index) => items[index])
            ),
        }),
        {}
      ),
    },
  });

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index: number) => estimateSize(columns, index).height,
    overscan,
    gap,
    lanes: columns,
    paddingEnd,
    initialMeasurementsCache: scrollInfo?.measurementsCache,
    initialOffset: scrollInfo?.scrollOffset,
  });

  useEffect(() => {
    if (!isInfinite) {
      return;
    }
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= items.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    isInfinite,
    hasNextPage,
    fetchNextPage,
    items.length,
    isFetchingNextPage,
    virtualizer.getVirtualItems(),
  ]);

  function onClick(index: number, event: MouseEvent) {
    if (!event.metaKey) {
      setCurrentIndex(index);
      return;
    }
    if (disableMultipleSelection) {
      return;
    }
    setSelection((prev) =>
      prev.includes(index) ? prev.filter((x) => x !== index) : [...prev, index]
    );
  }

  return (
    <div
      ref={scrollRef}
      className={className}
      onClick={() => setContext(context)}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map(({ index, lane, start }) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: 0,
              left: `${(lane / columns) * 100}%`,
              height: `${estimateSize(columns, index)}px`,
              width: `${100 / columns}%`,
              transform: `translateY(${start}px)`,
              paddingRight: `${paddingRight}px`,
            }}
          >
            {render({
              index,
              item: items[index],
              selected: selection.includes(index),
              hasFocus: currentContext === context,
              selection,
              onClick: (event: MouseEvent) => onClick(index, event),
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function withCurrentSelectionId<T extends HasId>(
  handler: (id: number) => void
) {
  return (selection: T[]) => {
    if (!selection.length) {
      return;
    }
    handler(selection[0].id);
  };
}

export function withCurrentSelection<T>(handler: (item: T) => void) {
  return (selection: T[]) => {
    if (!selection.length) {
      return;
    }
    handler(selection[0]);
  };
}
