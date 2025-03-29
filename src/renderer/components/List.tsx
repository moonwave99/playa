import { useState, useRef, useEffect, useLayoutEffect } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import useStore from "../store";
import { useKeyManager, withPrevent } from "../hooks/useKeyboardManager";
import useResponsiveColumns from "../hooks/useResponsiveColumns";
import { useClearSelection } from "../hooks/ipc";
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

type ListProps<T> = {
    items: T[];
    onEnter?: (item: T, event: KeyboardEvent) => void;
    onBackspace?: (selection: T[], event: KeyboardEvent) => void;
    onSelect?: (item: T) => void;
    onUp?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
    context?: string;
    className?: string;
    columnsConfig?: ColumnsConfigEntry[];
    render: (params: RenderParams<T>) => ReactNode;
    estimateSize?: (
        columns: number,
        index: number,
        showSidebar: boolean
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
};

function defaultEstimateSize(columns: number, _: number, showSidebar: boolean) {
    const containerWidth = showSidebar
        ? window.innerWidth - 384
        : window.innerWidth;

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
}: ListProps<T>) {
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [selection, setSelection] = useState<number[]>([]);

    const ref = useRef<HTMLDivElement>(null);
    const firstRender = useRef(true);
    const { showSidebar } = useStore();

    const { columns } = useResponsiveColumns({
        config: columnsConfig,
        onResize: () => {
            virtualizer.measure();
            virtualizer.scrollToIndex(currentIndex);
        },
    });

    useEffect(() => {
        virtualizer.measure();
    }, [showSidebar]);

    useClearSelection(() => setSelection([]));

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        onSelect && onSelect(items[currentIndex]);
        setSelection([currentIndex]);
    }, [currentIndex]);

    useEffect(() => {
        onSelectionChange && onSelectionChange(selection);
    }, [selection]);

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
            ArrowLeft: withPrevent((event: KeyboardEvent) => {
                if (
                    (columns === 1 || currentIndex == 0) &&
                    onLeft &&
                    !event.metaKey
                ) {
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
            " ": withPrevent(() => void 0),
        },
    });

    useLayoutEffect(() => {
        virtualizer.scrollToIndex(currentIndex);
    }, [currentIndex]);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => ref.current,
        estimateSize: (index: number) =>
            estimateSize(columns, index, showSidebar).height,
        overscan,
        gap,
        lanes: columns,
        paddingEnd,
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
            prev.includes(index)
                ? prev.filter((x) => x !== index)
                : [...prev, index]
        );
    }

    return (
        <div
            ref={ref}
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
                            height: `${estimateSize(
                                columns,
                                index,
                                showSidebar
                            )}px`,
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
                            onClick: (event: MouseEvent) =>
                                onClick(index, event),
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
