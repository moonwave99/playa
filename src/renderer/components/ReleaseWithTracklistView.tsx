import type { MouseEvent } from "react";
import { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";
import Tracklist from "./Tracklist";
import ListCard from "./ListCard";
import { withStopPropagation } from "@/lib/utils";
import styles from "./ReleaseWithTracklistView.module.css";

type ReleaseWithTracklistViewProps = {
    selected?: boolean;
    hasFocus?: boolean;
    inList?: boolean;
    release: ReleaseWithArtistAndTracksAndSubreleases;
    onContextMenu?: (
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
    const { id } = release;
    return (
        <article
            className={styles.releaseView}
            onClick={onClick}
            onContextMenu={
                onContextMenu &&
                withStopPropagation(() => onContextMenu([release], release.id))
            }
        >
            <ListCard
                item={release}
                selected={selected}
                hasFocus={hasFocus}
                isSingle={!inList}
            />
            <Tracklist
                release={release}
                isNavigable={!inList}
                onDoubleClick={(track_id) =>
                    window.api.system.playback({
                        release_id: id,
                        track_id,
                    })
                }
            />
        </article>
    );
}
