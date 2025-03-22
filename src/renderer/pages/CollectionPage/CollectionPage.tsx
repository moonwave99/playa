import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useParams, useSearchParams, Navigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    Collection,
    ReleaseWithArtist,
    ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import ReleaseList from "@/renderer/components/ReleaseList";
import Loading from "@/renderer/components/Loading";
import styles from "../Page.module.css";

export default function CollectionPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { isPending, error, data } = useQuery({
        queryKey: ["collections", +id],
        queryFn: () => window.api.data.getCollection(+id),
    });

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    if (!data) {
        return <Navigate replace to="/collections" />;
    }

    async function onTitleUpdate(title: string) {
        await window.api.data.updateCollection(+id, {
            title,
            releases: data.releases.map(({ id }: ReleaseWithArtist) => id),
        });

        [
            ["collections"],
            ["collections", "latest"],
            ["collections", id],
        ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    }

    async function deleteReleasesFromCollection(releases: ReleaseWithArtist[]) {
        if (
            !window.confirm(
                `Are you sure to remove ${releases.length} Releases from Collection?`
            )
        ) {
            return;
        }
        const ids = releases.map(({ id }) => id);
        await window.api.data.updateCollection(+id, {
            title: data.title,
            releases: data.releases
                .map(({ id }: ReleaseWithArtist) => id)
                .filter((id: number) => !ids.includes(id)),
        });

        [
            ["collections"],
            ["collections", "latest"],
            ["collections", id],
        ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    }

    function onContextMenu(
        selection: ReleaseWithArtistAndTracksAndSubreleases[],
        target_id: number
    ) {
        const target = data.releases.find(
            ({ id }: ReleaseWithArtist) => id === target_id
        );
        window.api.menu.release(
            selection.length ? selection : [target],
            target_id,
            data
        );
    }

    return (
        <div className={styles.page}>
            <Header
                collection={data}
                onTitleUpdate={onTitleUpdate}
                isFocused={!!searchParams.get("new")}
            />
            <ReleaseList
                releases={data.releases}
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
            Escape: () => {
                setEditing(false);
            },
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
