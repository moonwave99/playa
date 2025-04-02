import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useParams, useSearchParams, Navigate } from "react-router";
import type {
    Collection,
    ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import { getReleaseContextMenuParams } from "@/lib/utils";
import useCollection from "@/renderer/query/useCollection";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import { useClearSelectionOnLeave } from "@/renderer/hooks/ipc";
import ReleaseList from "@/renderer/components/ReleaseList";
import Loading from "@/renderer/components/Loading";
import styles from "../Page.module.css";

export default function CollectionPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const {
        collection,
        isPending,
        error,
        updateTitle,
        deleteReleasesFromCollection,
    } = useCollection(+id);

    useClearSelectionOnLeave();

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    if (!collection) {
        return <Navigate replace to="/collections" />;
    }

    function onContextMenu(
        selection: ReleaseWithArtistAndTracksAndSubreleases[],
        target_id: number
    ) {
        window.api.menu.release(
            ...getReleaseContextMenuParams({
                selection,
                target_id,
                context: collection,
            })
        );
    }

    return (
        <div className={styles.page}>
            <Header
                collection={collection}
                onTitleUpdate={updateTitle}
                isFocused={!!searchParams.get("new")}
            />
            <ReleaseList
                releases={collection.releases}
                onDelete={deleteReleasesFromCollection}
                onContextMenu={onContextMenu}
                className={styles.list}
            />
        </div>
    );
}

type HeaderProps = {
    collection: Collection;
    onTitleUpdate: (title: string) => void;
    isFocused?: boolean;
};

function Header({ collection, onTitleUpdate, isFocused }: HeaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState(collection.title);
    const [isEditing, setEditing] = useState(isFocused);

    const { setContext } = useKeyManager({
        context: "collection:input",
        handlers: {
            Escape: () => setEditing(false),
            Enter: () => setTimeout(() => setEditing(true), 100),
        },
    });

    useEffect(() => {
        if (isEditing) {
            setContext("collection:input");
            inputRef.current?.focus();
            return;
        }
        window.api.state.setInputFocused(false);
        setContext("list");
    }, [isEditing]);

    function onTitleFocus() {
        setContext("collection:input");
    }

    function onTitleBlur() {
        setContext("list");
    }

    if (!isEditing) {
        return (
            <h1
                onClick={() => setEditing(true)}
                className={styles.header}
                onContextMenu={() => window.api.menu.collection(collection)}
            >
                <span tabIndex={0} onFocus={onTitleFocus} onBlur={onTitleBlur}>
                    {title}
                </span>
            </h1>
        );
    }

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        setTimeout(() => setEditing(false), 100);
        onTitleUpdate(title);
    }

    return (
        <form onSubmit={onSubmit} className={styles.headerForm}>
            <input
                ref={inputRef}
                className={styles.headerInput}
                value={title}
                onInput={(event: FormEvent<HTMLInputElement>) =>
                    setTitle((event.target as HTMLInputElement).value)
                }
                onBlur={() => {
                    setEditing(false);
                    if (title.trim() === "") {
                        setTitle(collection.title);
                        return;
                    }
                    onTitleUpdate(title);
                    window.api.state.setInputFocused(false);
                }}
                onFocus={(event: FormEvent<HTMLInputElement>) => {
                    (event.target as HTMLInputElement).select();
                    window.api.state.setInputFocused(true);
                }}
                required
            />
        </form>
    );
}
