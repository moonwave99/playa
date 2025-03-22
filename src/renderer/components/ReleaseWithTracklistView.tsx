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
    const { artist, title, type, year } = release;
    return (
        <article
            className={cx(styles.releaseView, {
                [styles.selected]: selected,
                [styles.hasFocus]: selected && hasFocus,
            })}
            onClick={onClick}
        >
            <div className={styles.releaseSide}>
                <div className={styles.coverWrapper} title={title}>
                    <Cover
                        {...release}
                        title={`${artist.name} - ${getReleaseTitle(release)}`}
                        onContextMenu={() =>
                            onContextMenu([release], release.id)
                        }
                        className={styles.releaseListCover}
                    />
                </div>
                {inList ? (
                    <>
                        <h2 className={styles.releaseTitle}>
                            <Link to={getArtistLink(artist)}>
                                {artist.name}
                            </Link>{" "}
                        </h2>
                        <Link
                            className={styles.releaseArtist}
                            to={getReleaseLink(release)}
                        >
                            {getReleaseTitle(release)}
                        </Link>
                    </>
                ) : null}
                <p className={styles.releaseInfo}>
                    {type}, {year} {getDiscInfo(release)}
                </p>
            </div>
            <div className={styles.releaseMain}>
                <Tracklist release={release} isNavigable={!inList} />
            </div>
        </article>
    );
}
