import type { MouseEvent } from "react";
import api from "../api";
import cx from "clsx";
import Cover from "./Cover";
import Link from "./Link";
import { getReleaseTitle, getDiscInfo, withStopPropagation } from "@/lib/utils";
import { getReleaseLink } from "@/lib/links";
import type { ReleaseWithArtistAndSubreleases } from "@/types/types";
import styles from "./ReleaseView.module.css";
import EntityList from "./EntityList";

type ReleaseViewProps = {
    release: ReleaseWithArtistAndSubreleases;
    onClick: (event: MouseEvent) => void;
    onContextMenu?: () => void;
    selected?: boolean;
    hasFocus?: boolean;
};

export default function ReleaseView({
    release,
    selected,
    hasFocus,
    onClick,
    onContextMenu,
}: ReleaseViewProps) {
    const { artist, year, type, id, additionalArtists } = release;
    const releaseTitle = getReleaseTitle(release);
    return (
        <article
            className={cx(styles.releaseView, {
                [styles.selected]: selected,
                [styles.hasFocus]: selected && hasFocus,
            })}
            onClick={onClick}
            onContextMenu={withStopPropagation(onContextMenu)}
        >
            <p className={styles.info}>
                <span>
                    {type} {getDiscInfo(release)}
                </span>
                <span>{year}</span>
            </p>
            <Cover
                {...release}
                className={styles.coverWrapper}
                title={`${artist.name} - ${releaseTitle}`}
                onDoubleClick={() => api.system.playback({ release_id: id })}
            />
            <div className={styles.footer}>
                <EntityList
                    canDeleteFirstEntry={false}
                    items={[artist, ...additionalArtists]}
                    onDelete={(artist_id) =>
                        window.api.release.removeAdditionalArtist(id, artist_id)
                    }
                />
                <Link
                    className={styles.title}
                    to={getReleaseLink(release)}
                    title={`See ${releaseTitle} Tracks`}
                >
                    {releaseTitle}
                </Link>
            </div>
        </article>
    );
}
