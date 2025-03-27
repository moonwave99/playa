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
        context: "input",
        handlers: {
            Escape: () => setEditing(false),
        },
    });

    useEffect(() => {
        if (isEditing) {
            setContext("input");
            inputRef.current?.focus();
            return;
        }
        setContext("list");
    }, [isEditing]);

    if (!isEditing) {
        return (
            <h1
                onClick={() => setEditing(true)}
                className={styles.header}
                onContextMenu={() => window.api.menu.collection(collection)}
            >
                {title}
            </h1>
        );
    }

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        setEditing(false);
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
                }}
                onFocus={(event: FormEvent<HTMLInputElement>) => {
                    (event.target as HTMLInputElement).select();
                }}
                required
            />
        </form>
    );
}
