import { Fragment, type MouseEvent } from "react";
import { useSelect } from "../hooks/useSelect";
import type {
  Track,
  ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import { formatDuration, withStopPropagation } from "@/lib/utils";
import List from "./List";

import cx from "clsx";
import styles from "./Tracklist.module.css";

type TracklistProps = {
  isNavigable?: boolean;
  isFlipped?: boolean;
  selectedTrackId?: number;
  release: ReleaseWithArtistAndTracksAndSubreleases;
  context?: string;
  onDoubleClick?: (id: number) => void;
  onContextMenu?: (id: number) => void;
};

export default function Tracklist({
  isNavigable = false,
  isFlipped = false,
  release,
  context = "list",
  selectedTrackId,
  onDoubleClick,
  onContextMenu,
}: TracklistProps) {
  const { select } = useSelect("track", [selectedTrackId]);

  const allTracks = [
    ...(release.tracks || []),
    ...release.subReleases.flatMap((x) => x.tracks || []),
  ];

  const discsCount = release.subReleases.length + 1;

  const shouldDisplayTrackArtist =
    allTracks.every((x) => x.trackArtist) &&
    allTracks.some(
      (x) => x.trackArtist.toLowerCase() !== release.artist.name.toLowerCase()
    );

  if (!isNavigable) {
    return (
      <div
        className={cx(styles.tracklist, {
          [styles.isFlipped]: isFlipped,
        })}
        data-testid="Tracklist"
      >
        <div
          className={styles.discWrapper}
          style={{
            columnCount: discsCount,
            width: discsCount > 1 ? `${discsCount * 50}%` : undefined,
          }}
        >
          {[release, ...release.subReleases].map(
            ({ tracks, title, discTitle, id }) => (
              <Fragment key={id}>
                {release.subReleases.length ? (
                  <h2
                    className={styles.discTitle}
                    onContextMenu={withStopPropagation(() => onContextMenu(id))}
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
                    shouldDisplayTrackArtist={shouldDisplayTrackArtist}
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
      context={context}
      items={allTracks}
      initialSelection={
        selectedTrackId
          ? [allTracks.findIndex((x) => x.id === selectedTrackId)]
          : []
      }
      onSelectionChange={(selection) =>
        select(selection.map((index) => allTracks[index]?.id))
      }
      className={cx(styles.tracklist, styles.isNavigable, {
        [styles.isFlipped]: isFlipped,
        [styles.isInsideModal]: context === "modal:list",
      })}
      estimateSize={(_: number, index: number) => ({
        height:
          discsCount > 1 && titlesInfo.find((x) => x.index === index)
            ? index === 0
              ? 80
              : 112
            : 40,
        width: 200,
      })}
      paddingRight={0}
      gap={4}
      testId="Tracklist"
      render={({ item, index, selected, onClick }) => (
        <TrackEntry
          key={item.id}
          {...item}
          shouldDisplayTrackArtist={shouldDisplayTrackArtist}
          isFirst={index === 0}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onContextMenu={() => onContextMenu(item.releaseId)}
          isEven={index % 2 === 0}
          selected={selected}
          discTitle={titlesInfo.find((x) => x.index === index)?.discTitle}
        />
      )}
    />
  );
}

type TrackEntryProps = Track & {
  discTitle?: string;
  selected?: boolean;
  isEven?: boolean;
  isFirst?: boolean;
  shouldDisplayTrackArtist?: boolean;
  onClick?: (event: MouseEvent) => void;
  onDoubleClick: (id: number) => void;
  onContextMenu: () => void;
};

function TrackEntry({
  id,
  position,
  title,
  shouldDisplayTrackArtist,
  trackArtist,
  duration,
  discTitle,
  selected,
  isFirst,
  isEven,
  onClick,
  onDoubleClick,
  onContextMenu,
}: TrackEntryProps) {
  function renderTitle() {
    if (shouldDisplayTrackArtist) {
      return (
        <>
          <span className={styles.trackArtist}>{trackArtist}</span> - {title}
        </>
      );
    }
    return title;
  }

  return (
    <>
      {discTitle ? (
        <h2
          className={cx(styles.discTitle, { [styles.isFirst]: isFirst })}
          onContextMenu={withStopPropagation(onContextMenu)}
        >
          {discTitle}
        </h2>
      ) : null}
      <div
        title={`[${id}]`}
        onClick={onClick}
        onDoubleClick={(event) => {
          event.preventDefault();
          onDoubleClick(id);
        }}
        className={cx(styles.tracklistEntry, styles[isEven ? "odd" : "even"], {
          [styles.hasFocus]: selected,
        })}
      >
        <span className={styles.position}>{position}</span>
        <span className={styles.title}>{renderTitle()}</span>
        <span className={styles.duration}>{formatDuration(duration)}</span>
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
