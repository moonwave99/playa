import type { MouseEvent } from "react";
import cx from "clsx";
import Cover from "./Cover";
import Link from "./Link";
import useDominantColor from "../hooks/useDominantColor";
import {
    getCover,
    getArtistLink,
    getReleaseLink,
    getCollectionLink,
} from "@/lib/links";
import type {
    ArtistWithReleases,
    ReleaseWithArtist,
    CollectionWithReleases,
} from "@/types/types";
import styles from "./ListCard.module.css";

type Item = CollectionWithReleases | ArtistWithReleases | ReleaseWithArtist;

type ListCardProps = {
    item: Item;
    selected?: boolean;
    hasFocus?: boolean;
    isSingle?: boolean;
    onClick?: (event: MouseEvent) => void;
    onDoubleClick?: () => void;
    onContextMenu?: () => void;
};

function getCoverRelease(item: Item): ReleaseWithArtist {
    if ((item as ReleaseWithArtist).artist) {
        return item as ReleaseWithArtist;
    }
    return (item as { releases: ReleaseWithArtist[] }).releases[0];
}

export default function ListCard({
    item,
    selected,
    hasFocus,
    isSingle,
    onClick,
    onContextMenu,
}: ListCardProps) {
    const coverRelease = getCoverRelease(item);
    const { color, useDarkText } = useDominantColor(
        getCover(coverRelease.hash)
    );

    function getContent() {
        if ((item as ReleaseWithArtist).artist) {
            const release = item as ReleaseWithArtist;
            return (
                <>
                    <Link
                        className={styles.artist}
                        to={getArtistLink(release.artist)}
                    >
                        {release.artist.name}
                    </Link>
                    <Link className={styles.title} to={getReleaseLink(release)}>
                        {release.title}
                    </Link>
                    <div className={styles.info}>
                        {release.type}, {release.year}
                    </div>
                </>
            );
        }

        if ((item as ArtistWithReleases).name) {
            const artist = item as ArtistWithReleases;
            return (
                <>
                    <Link className={styles.title} to={getArtistLink(artist)}>
                        {artist.name}
                    </Link>
                    <div className={styles.info}>
                        {artist.releases.length} releases
                    </div>
                </>
            );
        }

        const collection = item as CollectionWithReleases;
        return (
            <>
                <Link
                    className={styles.title}
                    to={getCollectionLink(collection)}
                >
                    {collection.title}
                </Link>
                <div className={styles.info}>
                    {collection.releases.length} releases
                </div>
            </>
        );
    }

    return (
        <div
            className={cx(styles.listCard, {
                [styles.isSingle]: isSingle,
                [styles.selected]: selected,
                [styles.hasFocus]: selected && hasFocus,
                [styles.useDarkText]: useDarkText,
            })}
            onClick={onClick}
            onContextMenu={onContextMenu}
            style={{ background: color }}
        >
            <Cover
                {...coverRelease}
                className={styles.cover}
                title={`${coverRelease.artist.name} - ${coverRelease.title}`}
            />
            <div className={styles.content}>{getContent()}</div>
        </div>
    );
}
