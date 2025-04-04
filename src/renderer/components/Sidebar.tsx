import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import cx from "clsx";
import List from "@/renderer/components/List";
import type { RenderParams } from "@/renderer/components/List";
import { doContextsMatch } from "../hooks/useKeyboardManager";
import useSidebar from "../hooks/useSidebar";
import Loading from "./Loading";
import Link from "./Link";
import styles from "./Sidebar.module.css";
import { HasId } from "@/types/types";

type SidebarProps<T extends HasId> = {
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

export default function Sidebar<T extends HasId>({
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
    const [query, setQuery] = useState("");
    const { isPending, error, data } = useQuery<T[]>(queryConfig(query));
    const { inputRef, currentContext, inputHandlers, listHandlers } =
        useSidebar({ isPending, setQuery });

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

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
                ref={inputRef}
                className={styles.input}
                type="search"
                placeholder={`Search ${label}`}
                {...inputHandlers}
            />
            {!filteredItems.length ? (
                <div className={styles.noResults}>No results for {query}</div>
            ) : (
                <List
                    context="sidebar:list"
                    className={styles.listWrapper}
                    items={filteredItems}
                    estimateSize={estimateSize}
                    paddingRight={0}
                    gap={0}
                    disableMultipleSelection
                    onEnter={onEnter}
                    {...listHandlers}
                    render={renderItem || defaultRenderItem}
                    shouldPreventSpace
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

type DefaultEntryProps<T extends HasId> = Pick<
    SidebarProps<T>,
    "getLink" | "getEntryText" | "onContextMenu"
> & {
    selected: boolean;
    item: T;
    onClick: (event: MouseEvent) => void;
    currentContext: string;
};

function DefaultEntry<T extends HasId>({
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
            title={`[${item.id}]`}
            to={getLink(item)}
            className={cx(styles.listItem, {
                [styles.selected]: selected,
                [styles.hasFocus]:
                    selected && doContextsMatch(currentContext, "sidebar"),
            })}
            onClick={onClick}
            onContextMenu={() => onContextMenu && onContextMenu(item)}
        >
            {getEntryText(item)}
        </Link>
    );
}
