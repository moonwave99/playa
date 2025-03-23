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
    onDoubleClick?: (id: number) => void;
};

export default function Tracklist({
    isNavigable = false,
    release,
    onDoubleClick,
}: TracklistProps) {
    const { setContext } = useKeyManager({});

    const allTracks = [
        ...(release.tracks || []),
        ...release.subReleases.flatMap((x) => x.tracks || []),
    ];

    const firstTrackIndexes = getFirstTrackIndexes(allTracks);
    const discsCount = release.subReleases.length + 1;
    if (!isNavigable) {
        return (
            <div className={styles.tracklist}>
                <div
                    style={{
                        columnCount: discsCount,
                        width:
                            discsCount > 1 ? `${discsCount * 50}%` : undefined,
                    }}
                >
                    {allTracks.map(
                        ({ id, title, position, duration }, index) => (
                            <div
                                onDoubleClick={() => onDoubleClick(id)}
                                key={id}
                                className={cx(styles.tracklistEntry, {
                                    [styles.firstTrack]:
                                        firstTrackIndexes.includes(index),
                                })}
                            >
                                <span className={styles.count}>
                                    {position < 10 ? `0${position}` : position}.
                                </span>
                                <span className={styles.title}>{title}</span>
                                <span className={styles.duration}>
                                    {formatDuration(duration)}
                                </span>
                            </div>
                        )
                    )}
                </div>
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
                    onDoubleClick={() => onDoubleClick(item.id)}
                    className={cx(styles.tracklistEntry, {
                        hasFocus: selected,
                        [styles.firstTrack]: firstTrackIndexes.includes(index),
                    })}
                >
                    <span className={styles.count}>
                        {formatPosition(item.position)}.
                    </span>
                    <span className={styles.title}>{item.title}</span>
                    <span className={styles.duration}>
                        {formatDuration(item.duration)}
                    </span>
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

function formatDuration(duration: number) {
    const date = new Date(0);
    date.setSeconds(duration);
    const formatted = date.toISOString().substring(11, 19);
    if (duration < 600) {
        return formatted.slice(4);
    }
    if (duration < 3600) {
        return formatted.slice(3);
    }
    return formatted;
}

function formatPosition(position: number) {
    return position < 10 ? `0${position}` : position;
}
