import { useNavigate } from "react-router";
import { useState } from "react";
import type { MouseEvent } from "react";
import { useDebounce } from "use-debounce";
import api from "../api";
import useSearch from "../query/useSearch";
import useSidebar from "../hooks/useSidebar";
import { doContextsMatch } from "../hooks/useKeyboardManager";
import type { SearchResult } from "@/types/types";
import List from "@/renderer/components/List";
import Link from "@/renderer/components/Link";
import Cover from "@/renderer/components/Cover";
import Loading from "./Loading";
import ErrorView from "./ErrorView";
import Draggable from "./Draggable";

import cx from "clsx";
import styles from "./MusicSidebar.module.css";

const DEBOUNCE_MS = 300;

const itemDimensions = {
    width: 300,
    height: 64,
};

export default function MusicSidebar() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, DEBOUNCE_MS, {
        leading: false,
    });
    const { isPending, error, results } = useSearch({
        take: 100,
        query: debouncedQuery,
        queryKey: ["search", debouncedQuery],
        queryFn: api.searchResult.getSearchResults,
    });
    const { inputRef, currentContext, inputHandlers, listHandlers } =
        useSidebar({ isPending, setQuery });

    if (isPending) {
        return <Loading />;
    }

    if (error) {
        return <ErrorView error={error} />;
    }

    function onEnter(item: SearchResult, event: KeyboardEvent) {
        if (item.type === "release" && event.metaKey) {
            api.system.playback({ release_id: item.id });
            return;
        }
        if (item.type === "track" && event.metaKey) {
            api.system.playback({
                release_id: item.coverRelease.id,
                track_id: item.id,
            });
            return;
        }
        navigate(item.links[item.type]);
    }

    function isDraggable(item: SearchResult) {
        return ["release", "artist", "searchResult"].includes(item.type);
    }

    return (
        <div className={styles.view}>
            <input
                ref={inputRef}
                className={styles.input}
                type="search"
                placeholder="Search music"
                {...inputHandlers}
            />
            {!results.length ? (
                debouncedQuery && !isPending ? (
                    <div className={styles.noResults}>
                        No results for {debouncedQuery}
                    </div>
                ) : null
            ) : (
                <>
                    <List
                        disableMultipleSelection
                        context="sidebar:list"
                        className={styles.listWrapper}
                        items={results}
                        estimateSize={() => itemDimensions}
                        paddingRight={0}
                        gap={12}
                        onEnter={onEnter}
                        {...listHandlers}
                        render={({ item, selected, onClick }) => (
                            <SearchResultView
                                isDraggable={isDraggable(item)}
                                item={item}
                                selected={selected}
                                onClick={onClick}
                                currentContext={currentContext}
                                onContextMenu={() =>
                                    api.menu.searchResult(item)
                                }
                            />
                        )}
                    />
                    <footer className={styles.footer}>
                        Showing
                        <strong className={styles.count}>
                            {results.length}
                        </strong>
                        results
                    </footer>
                </>
            )}
        </div>
    );
}

type SearchResultViewProps = {
    selected: boolean;
    item: SearchResult;
    onClick: (event: MouseEvent) => void;
    currentContext: string;
    onContextMenu?: () => void;
    isDraggable?: boolean;
};

function SearchResultView({
    item,
    selected,
    onContextMenu,
    onClick,
    currentContext,
    isDraggable = false,
}: SearchResultViewProps) {
    const { title, type, artist, links, description, coverRelease } = item;

    function getTitle(): string {
        if (type === "release") {
            return `${artist} - ${title}`;
        }
        return title;
    }

    function getLink() {
        return links[type];
    }

    function renderCover() {
        if (type === "release" || coverRelease) {
            return (
                <Cover
                    {...(type === "release" ? item : coverRelease)}
                    className={styles.coverWrapper}
                />
            );
        }
        return <div className={styles.ghost}></div>;
    }

    function renderContent() {
        if (type === "track") {
            return (
                <>
                    <Link to={getLink()} className={styles.title}>
                        {getTitle()}
                    </Link>
                    <span className={styles.type}>
                        Track by{" "}
                        <Link
                            to={item.links.artist}
                            className={styles.trackArtist}
                        >
                            {artist}
                        </Link>
                    </span>
                </>
            );
        }
        return (
            <>
                <Link to={getLink()} className={styles.title}>
                    {getTitle()}
                </Link>
                <span className={styles.type}>{description}</span>
            </>
        );
    }

    return (
        <article
            onClick={onClick}
            className={cx(styles.listItem, {
                [styles.isDraggable]: isDraggable,
                [styles.selected]: selected,
                [styles.hasFocus]:
                    selected && doContextsMatch(currentContext, "sidebar"),
            })}
            onContextMenu={onContextMenu}
        >
            {renderCover()}
            <div className={styles.description}>{renderContent()}</div>
            {isDraggable && (
                <Draggable className={styles.dragHandle} item={item} />
            )}
        </article>
    );
}
