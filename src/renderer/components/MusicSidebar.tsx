import { useNavigate } from "react-router";
import { useState, useRef } from "react";
import type { FormEvent, MouseEvent } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import cx from "clsx";
import type { SearchResult } from "@/types/types";
import List from "@/renderer/components/List";
import Link from "@/renderer/components/Link";
import Cover from "@/renderer/components/Cover";

import {
    useKeyManager,
    KeyManager,
    withMeta,
} from "@/renderer/hooks/useKeyboardManager";
import Loading from "./Loading";
import styles from "./MusicSidebar.module.css";

const DEBOUNCE_MS = 300;

export default function MusicSidebar() {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, DEBOUNCE_MS, {
        leading: false,
    });
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

    const { isPending, error, data } = useQuery({
        queryKey: ["search", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) {
                return [];
            }
            return window.api.data.search(query, 100);
        },
        staleTime: DEBOUNCE_MS,
        placeholderData: keepPreviousData,
    });

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

    function onEnter(item: SearchResult, event: KeyboardEvent) {
        if (item.type === "release" && event.metaKey) {
            window.api.system.playback(item.id);
            return;
        }
        navigate(item.links[item.type]);
    }

    function estimateSize() {
        return {
            width: 300,
            height: 64,
        };
    }

    function onContextMenu(item: SearchResult) {
        window.api.menu.searchResult(item);
    }

    return (
        <div className={styles.view}>
            <input
                autoFocus
                ref={inputRef}
                className={styles.input}
                type="search"
                placeholder={`Search music`}
                onInput={onInput}
                onBlur={() => window.api.ui.inputBlur()}
                onFocus={() => {
                    setContext("input");
                    window.api.ui.inputFocus();
                }}
            />
            {!data.length ? (
                debouncedQuery && !isPending ? (
                    <div className={styles.noResults}>
                        No results for {debouncedQuery}
                    </div>
                ) : null
            ) : (
                <>
                    <List
                        onEnter={onEnter}
                        onUp={onUp}
                        className={styles.listWrapper}
                        items={data}
                        estimateSize={estimateSize}
                        paddingRight={0}
                        gap={0}
                        disableMultipleSelection
                        onRight={() => setContext("list")}
                        context="sidebar"
                        render={({ item, selected, onClick }) => (
                            <SearchResultView
                                item={item}
                                selected={selected}
                                onClick={onClick}
                                currentContext={currentContext}
                                onContextMenu={() => onContextMenu(item)}
                            />
                        )}
                    />
                    <footer className={styles.footer}>
                        Showing
                        <strong className={styles.count}>
                            {data.length}
                        </strong>{" "}
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
};

function SearchResultView({
    item,
    selected,
    onContextMenu,
    onClick,
    currentContext,
}: SearchResultViewProps) {
    const { id, title, type, hash, artist, links, description } = item;

    function getTitle(): string {
        if (type === "release") {
            return `${artist} - ${title}`;
        }
        return title;
    }

    function getLink() {
        return links[type];
    }

    return (
        <article
            onClick={onClick}
            className={cx(styles.listItem, {
                selected,
                hasFocus: selected && currentContext === "sidebar",
            })}
            onContextMenu={onContextMenu}
        >
            {type === "release" ? (
                <Cover
                    id={id}
                    hash={hash}
                    title={title}
                    className={styles.coverWrapper}
                />
            ) : (
                <div className={styles.ghost}></div>
            )}
            <div className={styles.description}>
                <Link to={getLink()} className={styles.title}>
                    {getTitle()}
                </Link>
                <span className={styles.type}>{description}</span>
            </div>
        </article>
    );
}
