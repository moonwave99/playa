import type { MouseEvent } from "react";
import cx from "clsx";
import Cover from "./Cover";
import Link from "./Link";
import { getReleaseTitle, getDiscInfo } from "@/lib/utils";
import { getArtistLink, getReleaseLink } from "@/lib/links";
import type { ReleaseWithArtistAndSubreleases } from "@/types/types";
import styles from "./ReleaseView.module.css";

type ReleaseViewProps = {
    release: ReleaseWithArtistAndSubreleases;
    onClick: (event: MouseEvent) => void;
    onDoubleClick?: () => void;
    onContextMenu?: () => void;
    selected?: boolean;
};

export default function ReleaseView({
    release,
    selected,
    onClick,
    onDoubleClick,
    onContextMenu,
}: ReleaseViewProps) {
    const { id, hash, title, artist, year, type } = release;
    return (
        <article
            className={cx(styles.view, { [styles.selected]: selected })}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onContextMenu={onContextMenu}
        >
            <p className={styles.info}>
                <span>
                    {type} {getDiscInfo(release)}
                </span>
                <span>{year}</span>
            </p>
            <Cover
                id={id}
                className={styles.coverWrapper}
                hash={hash}
                title={`${artist.name} - ${title}`}
            />
            <div className={styles.footer}>
                <Link
                    className={styles.artist}
                    to={getArtistLink(artist)}
                    title={`See ${artist.name} Releases`}
                >
                    {artist.name}
                </Link>
                <Link
                    className={styles.title}
                    to={getReleaseLink(release)}
                    title={`See ${title} Tracks`}
                >
                    {getReleaseTitle(release)}
                </Link>
            </div>
        </article>
    );
}
