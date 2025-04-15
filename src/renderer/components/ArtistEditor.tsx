import { FormEvent } from "react";
import { Artist } from "@/types/types";
import { capitalize } from "lodash";
import Cover from "./Cover";
import cx from "clsx";
import { MdRemoveCircle, MdAddCircle } from "react-icons/md";
import styles from "./ArtistsEditor.module.css";
import formStyles from "../forms.module.css";
import buttonStyles from "../buttons.module.css";

type ArtistEditorProps = {
    query: string;
    artists: Artist[];
    results: Artist[];
    onAdd: (id: number) => void;
    onRemove: (id: number) => void;
    inputHandlers: {
        onInput: (event: FormEvent) => void;
        onBlur: () => void;
        onFocus: () => void;
    };
    title: string;
};

export default function ArtistEditor({
    query,
    artists,
    results,
    onAdd,
    onRemove,
    inputHandlers,
    title,
}: ArtistEditorProps) {
    return (
        <div className={formStyles.container}>
            <h2>{title}</h2>
            {!artists.length ? (
                <p className={styles.Placeholder}>No artists yet.</p>
            ) : (
                <ArtistList
                    artists={artists}
                    type="remove"
                    onClick={onRemove}
                />
            )}
            <label className={cx(formStyles.label)}>
                Lookup Artists
                <input
                    className={formStyles.input}
                    type="search"
                    placeholder="Search artist"
                    {...inputHandlers}
                />
            </label>
            {!results?.length ? (
                <p className={styles.Placeholder}>
                    {query && (
                        <>
                            No results for <strong>{query}</strong>.
                        </>
                    )}
                </p>
            ) : (
                results && (
                    <ArtistList artists={results} type="add" onClick={onAdd} />
                )
            )}
        </div>
    );
}

type ArtistListProps = {
    artists: Artist[];
    type: "add" | "remove";
    onClick: (id: number) => void;
};

function ArtistList({ artists, type, onClick }: ArtistListProps) {
    return (
        <div className={styles.ArtistListWrapper}>
            <ul className={styles.ArtistList}>
                {artists.map((artist: Artist) => (
                    <li key={artist.id}>
                        <ArtistCard
                            type={type}
                            artist={artist}
                            onClick={() => onClick(artist.id)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

type ArtistCardProps = {
    artist: Artist;
    type: ArtistListProps["type"];
    onClick: () => void;
};

function ArtistCard({ artist, type, onClick }: ArtistCardProps) {
    const { name, coverRelease, id } = artist;
    return (
        <article className={styles.ArtistCard}>
            <button
                type="button"
                className={buttonStyles.CornerActionButton}
                onClick={onClick}
                aria-label={`${capitalize(type)} artist: ${name}`}
            >
                {type === "add" ? <MdAddCircle /> : <MdRemoveCircle />}
            </button>
            <Cover className={styles.ArtistCardCover} {...coverRelease} />
            <span className={styles.ArtistCardTitle} title={`[${id}]`}>
                {name}
            </span>
        </article>
    );
}
