import { Fragment } from "react";
import type { MouseEvent } from "react";
import api from "../api";
import { useKeyManager } from "../hooks/useKeyboardManager";
import type {
    Track,
    ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import { withStopPropagation } from "@/lib/utils";
import List from "./List";
import cx from "clsx";

import styles from "./Tracklist.module.css";

type TracklistProps = {
    isNavigable?: boolean;
    selectedTrackId?: number;
    release: ReleaseWithArtistAndTracksAndSubreleases;
    onDoubleClick?: (id: number) => void;
    onContextMenu?: (id: number) => void;
};

export default function Tracklist({
    isNavigable = false,
    release,
    selectedTrackId,
    onDoubleClick,
    onContextMenu,
}: TracklistProps) {
    const { setContext } = useKeyManager();

    const allTracks = [
        ...(release.tracks || []),
        ...release.subReleases.flatMap((x) => x.tracks || []),
    ];

    const discsCount = release.subReleases.length + 1;

    if (!isNavigable) {
        return (
            <div className={styles.tracklist}>
                <div
                    className={styles.discWrapper}
                    style={{
                        columnCount: discsCount,
                        width:
                            discsCount > 1 ? `${discsCount * 50}%` : undefined,
                    }}
                >
                    {[release, ...release.subReleases].map(
                        ({ tracks, title, discTitle, id }) => (
                            <Fragment key={id}>
                                {release.subReleases.length ? (
                                    <h2
                                        className={styles.discTitle}
                                        onContextMenu={withStopPropagation(() =>
                                            onContextMenu(id)
                                        )}
                                    >
                                        {discTitle || title}
                                    </h2>
                                ) : null}
                                {tracks.map((track, index) => (
                                    <TrackEntry
                                        key={track.id}
                                        {...track}
                                        isEven={index % 2 === 0}
                                        onDoubleClick={onDoubleClick}
                                        onContextMenu={() => onContextMenu(id)}
                                    />
                                ))}
                            </Fragment>
                        )
                    )}
                </div>
            </div>
        );
    }

    const titlesInfo = getTitlesInfo(release);

    return (
        <List
            disableMultipleSelection
            context="list"
            onEnter={(item) =>
                api.system.playback({
                    release_id: release.id,
                    track_id: item.id,
                })
            }
            items={allTracks}
            initialSelection={
                selectedTrackId
                    ? [allTracks.findIndex((x) => x.id === selectedTrackId)]
                    : []
            }
            className={cx(styles.tracklist, styles.isNavigable)}
            estimateSize={(_: number, index: number) => ({
                height:
                    discsCount > 1 && titlesInfo.find((x) => x.index === index)
                        ? 112
                        : 40,
                width: 200,
            })}
            paddingRight={0}
            gap={4}
            onLeft={() => setContext("sidebar")}
            render={({ item, index, selected, onClick }) => (
                <TrackEntry
                    key={item.id}
                    {...item}
                    onClick={onClick}
                    onDoubleClick={onDoubleClick}
                    onContextMenu={() => onContextMenu(item.releaseId)}
                    isEven={index % 2 === 0}
                    selected={selected}
                    discTitle={
                        titlesInfo.find((x) => x.index === index)?.discTitle
                    }
                />
            )}
        />
    );
}

type TrackEntryProps = Track & {
    discTitle?: string;
    selected?: boolean;
    isEven?: boolean;
    onClick?: (event: MouseEvent) => void;
    onDoubleClick: (id: number) => void;
    onContextMenu: () => void;
};

function TrackEntry({
    id,
    position,
    title,
    duration,
    discTitle,
    selected,
    isEven,
    onClick,
    onDoubleClick,
    onContextMenu,
}: TrackEntryProps) {
    return (
        <>
            {discTitle ? (
                <h2
                    className={styles.discTitle}
                    onContextMenu={withStopPropagation(onContextMenu)}
                >
                    {discTitle}
                </h2>
            ) : null}
            <div
                onClick={onClick}
                onDoubleClick={(event) => {
                    event.preventDefault();
                    onDoubleClick(id);
                }}
                className={cx(
                    styles.tracklistEntry,
                    styles[isEven ? "odd" : "even"],
                    {
                        [styles.hasFocus]: selected,
                    }
                )}
            >
                <span className={styles.position}>{position}</span>
                <span className={styles.title}>{title}</span>
                <span className={styles.duration}>
                    {formatDuration(duration)}
                </span>
            </div>
        </>
    );
}

function getTitlesInfo(
    release: ReleaseWithArtistAndTracksAndSubreleases
): { discTitle: string; index: number }[] {
    const tracks = [
        ...(release.tracks || []),
        ...release.subReleases.flatMap((x) => x.tracks || []),
    ];
    const titlesById: Record<number, string> = [
        release,
        ...release.subReleases,
    ].reduce((memo, { id, discTitle }) => ({ ...memo, [id]: discTitle }), {});

    const info = [];
    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i]?.releaseId !== tracks[i - 1]?.releaseId) {
            info.push({
                discTitle: titlesById[tracks[i]?.releaseId],
                index: i,
            });
        }
    }
    return info;
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
