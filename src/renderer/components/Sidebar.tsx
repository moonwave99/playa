import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { Artist, Collection, Group, Release } from "@/types/types";
import List from "@/renderer/components/List";
import Draggable, { type DraggableItem } from "@/renderer/components/Draggable";
import type { RenderParams } from "@/renderer/components/List";
import { doContextsMatch } from "../hooks/useKeyboardManager";
import useSidebar from "../hooks/useSidebar";
import Loading from "./Loading";
import ErrorView from "./ErrorView";
import Link from "./Link";

import cx from "clsx";
import styles from "./Sidebar.module.css";

type Item = Artist | Release | Collection | Group;

type SidebarProps = {
    label: string;
    queryConfig: (query: string) => {
        queryKey: QueryKey;
        queryFn: () => Promise<Item[]>;
    };
    onEnter: (entry: Item) => void;
    onContextMenu?: (entry: Item) => void;
    filterFn: (entry: Item, query: string) => boolean;
    getLink: (entry: Item) => string;
    getEntryText: (entry: Item) => string;
    estimateSize?: () => { width: number; height: number };
    renderItem?: (params: RenderParams<Item>) => ReactNode;
};

export default function Sidebar({
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
}: SidebarProps) {
    const [query, setQuery] = useState("");
    const { isPending, error, data } = useQuery<Item[]>(queryConfig(query));
    const { inputRef, currentContext, inputHandlers, listHandlers } =
        useSidebar({ isPending, setQuery });

    if (isPending) {
        return <Loading />;
    }

    if (error) {
        return <ErrorView error={error} />;
    }

    function defaultRenderItem({
        item,
        selected,
        onClick,
    }: {
        item: Item;
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
                isDraggable={item._type === "artist"}
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

type DefaultEntryProps = Pick<
    SidebarProps,
    "getLink" | "getEntryText" | "onContextMenu"
> & {
    selected: boolean;
    item: Item;
    onClick: (event: MouseEvent) => void;
    currentContext: string;
    isDraggable?: boolean;
};

function DefaultEntry({
    item,
    selected,
    getLink,
    getEntryText,
    onContextMenu,
    onClick,
    currentContext,
    isDraggable = false,
}: DefaultEntryProps) {
    return (
        <div
            className={cx(styles.listItem, {
                [styles.isDraggable]: isDraggable,
                [styles.selected]: selected,
                [styles.hasFocus]:
                    selected && doContextsMatch(currentContext, "sidebar"),
            })}
        >
            <Link
                title={`[${item.id}]`}
                to={getLink(item)}
                onClick={onClick}
                onContextMenu={() => onContextMenu && onContextMenu(item)}
            >
                {getEntryText(item)}
            </Link>
            {isDraggable && (
                <Draggable
                    className={styles.dragHandle}
                    item={item as DraggableItem}
                />
            )}
        </div>
    );
}
