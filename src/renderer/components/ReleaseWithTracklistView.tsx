import type { MouseEvent } from "react";
import { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";
import cx from "clsx";
import Tracklist from "./Tracklist";
import Cover from "./Cover";
import Link from "./Link";
import { getReleaseTitle, getDiscInfo } from "@/lib/utils";
import { getReleaseLink, getArtistLink } from "@/lib/links";
import styles from "./ReleaseWithTracklistView.module.css";

type ReleaseWithTracklistViewProps = {
    selected?: boolean;
    hasFocus?: boolean;
    inList?: boolean;
    release: ReleaseWithArtistAndTracksAndSubreleases;
    onContextMenu: (
        selection: ReleaseWithArtistAndTracksAndSubreleases[],
        target_id: number
    ) => void;
    onClick?: (event: MouseEvent) => void;
};

export default function ReleaseWithTracklistView({
    selected,
    hasFocus,
    inList = false,
    release,
    onContextMenu,
    onClick,
}: ReleaseWithTracklistViewProps) {
    const { artist, type, year } = release;
    const releaseTitle = getReleaseTitle(release);
    return (
        <article
            className={cx(styles.releaseView, {
                selected,
                hasFocus: selected && hasFocus,
                [styles.isSingle]: !inList,
            })}
            onClick={onClick}
        >
            <header className={styles.header}>
                <Cover
                    {...release}
                    title={`${artist.name} - ${releaseTitle}`}
                    onContextMenu={() => onContextMenu([release], release.id)}
                    className={styles.cover}
                />

                <div className={styles.content}>
                    <Link className={styles.artist} to={getArtistLink(artist)}>
                        {artist.name}
                    </Link>
                    <Link className={styles.title} to={getReleaseLink(release)}>
                        {getReleaseTitle(release)}
                    </Link>
                    <div className={styles.info}>
                        {type}, {year} {getDiscInfo(release)}
                    </div>
                </div>
            </header>
            <Tracklist release={release} isNavigable={!inList} />
        </article>
    );
}
