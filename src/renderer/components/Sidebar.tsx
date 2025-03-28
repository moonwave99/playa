import { useState, useRef } from "react";
import type { FormEvent, MouseEvent, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import cx from "clsx";
import List from "@/renderer/components/List";
import type { RenderParams } from "@/renderer/components/List";
import {
    useKeyManager,
    KeyManager,
    withMeta,
} from "@/renderer/hooks/useKeyboardManager";
import Loading from "./Loading";
import Link from "./Link";
import styles from "./Sidebar.module.css";

type SidebarProps<T> = {
    label: string;
    queryConfig: (query: string) => {
        queryKey: QueryKey;
        queryFn: () => Promise<T[]>;
    };
    onEnter: (entry: T) => void;
    onContextMenu?: (entry: T) => void;
    filterFn: (entry: T, query: string) => boolean;
    getLink: (entry: T) => string;
    getEntryText: (entry: T) => string;
    estimateSize?: () => { width: number; height: number };
    renderItem?: (params: RenderParams<T>) => ReactNode;
};

export default function Sidebar<T>({
    label,
    queryConfig,
    onEnter,
    onContextMenu,
    filterFn,
    getEntryText,
    getLink,
    estimateSize = () => ({
        width: 300,
        height: 32,
    }),
    renderItem,
}: SidebarProps<T>) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const { setContext, currentContext } = useKeyManager({
        context: "input",
        handlers: {
            ArrowDown: () => {
                inputRef.current?.blur();
                setContext("sidebar");
            },
            ArrowRight: () => {
                if (query === "") {
                    inputRef.current?.blur();
                    setContext("list");
                }
            },
        },
    });

    useKeyManager({
        context: KeyManager.global,
        handlers: {
            f: withMeta(() => inputRef.current?.focus()),
        },
    });

    const { isPending, error, data } = useQuery<T[]>(queryConfig(query));

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    function onUp() {
        inputRef.current?.focus();
        setContext("input");
    }

    function onInput(event: FormEvent<HTMLInputElement>) {
        setQuery((event.target as HTMLInputElement).value);
    }

    function defaultRenderItem({
        item,
        selected,
        onClick,
    }: {
        item: T;
        selected: boolean;
        onClick: (event: MouseEvent) => void;
    }) {
        return (
            <DefaultEntry
                item={item}
                selected={selected}
                currentContext={currentContext}
                getLink={getLink}
                getEntryText={getEntryText}
                onClick={onClick}
                onContextMenu={onContextMenu}
            />
        );
    }

    const filteredItems = data.filter((item) => filterFn(item, query));

    return (
        <div className={styles.view}>
            <input
                autoFocus
                ref={inputRef}
                className={styles.input}
                type="search"
                placeholder={`Search ${label}`}
                onInput={onInput}
                onBlur={() => window.api.ui.inputBlur()}
                onFocus={() => {
                    setContext("input");
                    window.api.ui.inputFocus();
                }}
            />
            {!filteredItems.length ? (
                <div className={styles.noResults}>No results for {query}</div>
            ) : (
                <List
                    onUp={onUp}
                    onEnter={onEnter}
                    className={styles.listWrapper}
                    items={filteredItems}
                    estimateSize={estimateSize}
                    paddingRight={0}
                    gap={0}
                    disableMultipleSelection
                    onRight={() => setContext("list")}
                    context="sidebar"
                    render={renderItem || defaultRenderItem}
                />
            )}
            <footer className={styles.footer}>
                There are{" "}
                <strong className={styles.count}>{data.length}</strong> {label}{" "}
                in total
            </footer>
        </div>
    );
}

type DefaultEntryProps<T> = Pick<
    SidebarProps<T>,
    "getLink" | "getEntryText" | "onContextMenu"
> & {
    selected: boolean;
    item: T;
    onClick: (event: MouseEvent) => void;
    currentContext: string;
};

function DefaultEntry<T>({
    item,
    selected,
    getLink,
    getEntryText,
    onContextMenu,
    onClick,
    currentContext,
}: DefaultEntryProps<T>) {
    return (
        <Link
            to={getLink(item)}
            className={cx(styles.listItem, {
                selected,
                hasFocus: selected && currentContext === "sidebar",
            })}
            onClick={onClick}
            onContextMenu={() => onContextMenu && onContextMenu(item)}
        >
            {getEntryText(item)}
        </Link>
    );
}
