import type { MouseEvent } from "react";
import api from "../api";
import { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";
import Tracklist from "./Tracklist";
import ListCard from "./ListCard";
import { withStopPropagation } from "@/lib/utils";
import useStore from "../store";
import styles from "./ReleaseWithTracklistView.module.css";

type ReleaseWithTracklistViewProps = {
    selected?: boolean;
    hasFocus?: boolean;
    isSingle?: boolean;
    release: ReleaseWithArtistAndTracksAndSubreleases;
    selectedTrackId?: number;
    onContextMenu?: (
        selection: ReleaseWithArtistAndTracksAndSubreleases[],
        target_id: number
    ) => void;
    onClick?: (event: MouseEvent) => void;
};

export default function ReleaseWithTracklistView({
    selected,
    hasFocus,
    isSingle = false,
    release,
    selectedTrackId,
    onContextMenu,
    onClick,
}: ReleaseWithTracklistViewProps) {
    const { id } = release;
    const { setUseDarkText } = useStore();

    function onDiscContextMenu(id: number) {
        const foundRelease = [release, ...release.subReleases].find(
            (x) => x.id === id
        );
        api.menu.release([{ ...foundRelease, artist: release.artist }], 0);
    }

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
                isSingle={isSingle}
                onColorChange={isSingle ? setUseDarkText : null}
            />
            <Tracklist
                release={release}
                selectedTrackId={selectedTrackId}
                isNavigable={isSingle}
                onContextMenu={onDiscContextMenu}
                onDoubleClick={(track_id) =>
                    api.system.playback({
                        release_id: id,
                        track_id,
                    })
                }
            />
        </article>
    );
}
