import cx from "clsx";
import List from "./List";
import { useKeyManager } from "../hooks/useKeyboardManager";
import type {
    Track,
    ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";

import styles from "./Tracklist.module.css";

type TracklistProps = {
    isNavigable?: boolean;
    release: ReleaseWithArtistAndTracksAndSubreleases;
};

export default function Tracklist({
    isNavigable = false,
    release,
}: TracklistProps) {
    const { setContext } = useKeyManager({});

    const allTracks = [
        ...(release.tracks || []),
        ...release.subReleases.flatMap((x) => x.tracks || []),
    ];

    const firstTrackIndexes = getFirstTrackIndexes(allTracks);

    if (!isNavigable) {
        return (
            <div className={styles.tracklist}>
                {allTracks.map((item, index) => (
                    <div
                        key={item.id}
                        className={cx(styles.tracklistEntry, {
                            [styles.firstTrack]:
                                firstTrackIndexes.includes(index),
                        })}
                    >
                        <span className={styles.count}>
                            {item.position < 10
                                ? `0${item.position}`
                                : item.position}
                            .
                        </span>
                        <span className={styles.title}>{item.title}</span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <List
            disableMultipleSelection
            context="list"
            onEnter={(item) => window.api.system.playback(release.id, item.id)}
            items={allTracks}
            className={cx(styles.tracklist, styles.isNavigable)}
            estimateSize={(_: number, index: number) => ({
                height: firstTrackIndexes.includes(index) ? 48 : 24,
                width: 200,
            })}
            gap={4}
            onLeft={() => setContext("sidebar")}
            render={({ item, index, selected, onClick }) => (
                <div
                    onClick={onClick}
                    className={cx(styles.tracklistEntry, {
                        hasFocus: selected,
                        [styles.firstTrack]: firstTrackIndexes.includes(index),
                    })}
                >
                    <span className={styles.count}>
                        {item.position < 10
                            ? `0${item.position}`
                            : item.position}
                        .
                    </span>
                    <span className={styles.title}>{item.title}</span>
                </div>
            )}
        />
    );
}

function getFirstTrackIndexes(tracks: Track[]): number[] {
    const indexes = [];
    for (let i = 1; i < tracks.length; i++) {
        if (tracks[i].position === 1) {
            indexes.push(i);
        }
    }
    return indexes;
}
