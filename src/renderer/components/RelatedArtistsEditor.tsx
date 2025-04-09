import { Artist } from "@/types/types";
import useRelatedArtists from "../query/useRelatedArtists";
import Loading from "./Loading";
import Cover from "./Cover";
import cx from "clsx";
import { MdRemoveCircle, MdAddCircle } from "react-icons/md";
import styles from "./RelatedArtistsEditor.module.css";
import formStyles from "../forms.module.css";

type RelatedArtistsEditorProps = {
    id: number;
};

export default function RelatedArtistsEditor({
    id,
}: RelatedArtistsEditorProps) {
    const {
        query,
        artist,
        inputRef,
        inputHandlers,
        addRelatedArtist,
        removeRelatedArtist,
        results,
    } = useRelatedArtists(id);

    if (!artist) {
        return <Loading />;
    }

    return (
        <div className={formStyles.container}>
            <h2>Related Artists</h2>
            {!artist.relatedArtists.length ? (
                <p className={styles.placeholder}>No related artists yet.</p>
            ) : (
                <ArtistList
                    artists={artist.relatedArtists}
                    type="remove"
                    onClick={removeRelatedArtist}
                />
            )}
            <label className={cx(formStyles.label)}>
                Lookup Related Artists
                <input
                    ref={inputRef}
                    className={formStyles.input}
                    type="search"
                    placeholder="Search artist"
                    {...inputHandlers}
                />
            </label>
            {!results?.length && query ? (
                <p className={styles.placeholder}>
                    No results for <strong>{query}</strong>.
                </p>
            ) : (
                results && (
                    <ArtistList
                        artists={results}
                        type="add"
                        onClick={addRelatedArtist}
                    />
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
        <div className={styles.artistListWrapper}>
            <ul className={styles.artistList}>
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
    type: "add" | "remove";
    onClick: () => void;
};

function ArtistCard({ artist, type, onClick }: ArtistCardProps) {
    return (
        <article className={styles.ArtistCard}>
            <button
                className={styles.ArtistCardButton}
                onClick={onClick}
                aria-label={
                    type == "add"
                        ? "Add related Artist"
                        : "Remove related Artist"
                }
            >
                {type === "add" ? <MdAddCircle /> : <MdRemoveCircle />}
            </button>
            <Cover
                className={styles.ArtistCardCover}
                {...artist.coverRelease}
            />
            <span title={`[${artist.id}]`}>{artist.name}</span>
        </article>
    );
}
