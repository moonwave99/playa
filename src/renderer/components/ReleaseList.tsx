import { useNavigate } from "react-router";
import type {
  Release,
  ReleaseWithArtist,
  ReleaseWithArtistAndTracksAndSubreleases,
  ReleaseListViewMode,
} from "@/types/types";
import type { ScrollToOptions } from "@tanstack/react-virtual";
import {
  releaseColumnsConfig,
  compactColumnsConfig,
} from "../hooks/useResponsiveColumns";
import { useApiEvents } from "../hooks/useApiEvents";
import { withoutShift, withPrevent } from "../hooks/useKeyboardManager";
import useStore from "../store";
import api from "../api";
import { getReleaseLink } from "@/lib/links";
import {
  estimateListCardSize,
  getReleaseWithTracklistHeight,
} from "@/lib/utils";
import ReleaseView from "./ReleaseView";
import ReleaseWithTracklistView from "./ReleaseWithTracklistView";
import List, { type RenderParams, type ListKeyHandler } from "./List";
import ListCard from "./ListCard";
import cx from "clsx";
import styles from "./ReleaseList.module.css";
import useRestoreListPosition from "../hooks/useRestoreListPosition";

type ReleaseListProps = {
  releases: ReleaseWithArtistAndTracksAndSubreleases[];
  onDelete?: (releases: ReleaseWithArtist[], event: KeyboardEvent) => void;
  onSelect?: (selection: number[]) => void;
  onContextMenu?: (
    selection: ReleaseWithArtistAndTracksAndSubreleases[],
    target_id: number
  ) => void;
  className?: string;
  keyHandlers?: Record<string, ListKeyHandler<ReleaseWithArtist>>;
  context: unknown[];
};

export default function ReleaseList({
  releases,
  onSelect,
  onDelete,
  onContextMenu,
  className,
  keyHandlers = {},
  context,
}: ReleaseListProps) {
  const navigate = useNavigate();

  const { releaseListViewMode, toggleViewMode, setModalContents } = useStore();

  useApiEvents({
    onToggleViewMode: () => toggleViewMode("releaseList"),
  });

  const { scrollInfo, storeScrollInfo } = useRestoreListPosition({
    key: context,
  });

  function onEnter(
    release: ReleaseWithArtistAndTracksAndSubreleases,
    event: KeyboardEvent
  ) {
    if (event.metaKey) {
      api.system.playback({ release_id: release.id });
      return;
    }
    navigate(getReleaseLink(release));
  }

  function _onContextMenu(selection: number[], index: number) {
    onContextMenu(
      selection.map((index: number) => releases[index]),
      releases[index].id
    );
  }

  function getListConfig(viewMode: ReleaseListViewMode) {
    if (viewMode === "grid") {
      return {
        columnsConfig: releaseColumnsConfig,
        paddingRight: 16,
        render: ({
          item,
          index,
          selection,
          ...rest
        }: RenderParams<ReleaseWithArtistAndTracksAndSubreleases>) => (
          <ReleaseView
            {...rest}
            release={item}
            onContextMenu={() => _onContextMenu(selection, index)}
          />
        ),
      };
    }
    if (viewMode === "list") {
      return {
        overscan: 3,
        scrollBehavior: { align: "start" } as ScrollToOptions,
        estimateSize: (_: number, index: number) => ({
          width: "100%",
          height: getReleaseWithTracklistHeight(releases[index]),
        }),
        render: ({
          item,
          index,
          selection,
          ...rest
        }: RenderParams<ReleaseWithArtistAndTracksAndSubreleases>) => (
          <ReleaseWithTracklistView
            {...rest}
            release={item}
            onContextMenu={() => _onContextMenu(selection, index)}
          />
        ),
      };
    }
    if (viewMode === "compact") {
      return {
        columnsConfig: compactColumnsConfig,
        estimateSize: estimateListCardSize,
        render: ({
          item,
          index,
          selection,
          ...rest
        }: RenderParams<ReleaseWithArtistAndTracksAndSubreleases>) => (
          <ListCard
            {...rest}
            item={item}
            onContextMenu={() => _onContextMenu(selection, index)}
          />
        ),
      };
    }
  }

  return (
    <List
      shouldPreventSpace
      key={`${releaseListViewMode}-${getTotalTracks(releases)}`}
      items={releases}
      className={cx(styles.list, styles[releaseListViewMode], className)}
      onEnter={onEnter}
      onBackspace={onDelete}
      onSelectionChange={(selection) =>
        onSelect(selection.map((index) => releases[index].id))
      }
      {...getListConfig(releaseListViewMode)}
      onUnmount={storeScrollInfo}
      scrollInfo={scrollInfo}
      testId="ReleaseList"
      keyHandlers={{
        ...keyHandlers,
        " ": withPrevent((_event: KeyboardEvent, selection: Release[]) => {
          setModalContents({
            name: "lightbox",
            params: {
              release: selection[0],
              context: releases,
            },
          });
        }),
        d: withoutShift((_event: KeyboardEvent, selection: Release[]) =>
          api.release.deleteCover(selection[0])
        ),
      }}
    />
  );
}

function getTotalTracks(releases: ReleaseWithArtistAndTracksAndSubreleases[]) {
  return releases
    .flatMap((rel) => [rel, ...rel.subReleases])
    .reduce((memo, { tracks }) => memo + tracks.length, 0);
}
