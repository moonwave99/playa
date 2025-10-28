import type {
  ReleaseWithArtist,
  ReleaseWithArtistAndTracksAndSubreleases,
  ReleaseListViewMode,
  HasId,
} from "@/types/types";
import type { ScrollToOptions } from "@tanstack/react-virtual";
import useRestoreListPosition from "../hooks/useRestoreListPosition";
import { useReleaseLightbox } from "../hooks/useReleaseLightbox";
import {
  releaseColumnsConfig,
  compactColumnsConfig,
} from "../hooks/useResponsiveColumns";
import { withPrevent } from "../hooks/useKeyboardManager";
import { useApiEvents } from "../hooks/useApiEvents";
import useStore from "../store";
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
  const { getListViewMode, toggleListViewMode } = useStore();
  const openLightbox = useReleaseLightbox({ context: releases });

  useApiEvents({
    onToggleListViewMode: () => toggleListViewMode("release"),
  });

  const { scrollInfo, storeScrollInfo } = useRestoreListPosition({
    key: context,
  });

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

  const viewMode = getListViewMode("release");

  return (
    <List
      shouldPreventSpace
      key={`${viewMode}-${getTotalTracks(releases)}`}
      items={releases}
      className={cx(styles.list, styles[viewMode], className)}
      onBackspace={onDelete}
      onSelectionChange={(selection) =>
        onSelect(selection.map((index) => releases[index].id))
      }
      {...getListConfig(viewMode)}
      onUnmount={storeScrollInfo}
      scrollInfo={scrollInfo}
      testId="ReleaseList"
      keyHandlers={{
        ...keyHandlers,
        " ": withPrevent((_, selection: HasId[]) => openLightbox(selection)),
      }}
    />
  );
}

function getTotalTracks(releases: ReleaseWithArtistAndTracksAndSubreleases[]) {
  return releases
    .flatMap((rel) => [rel, ...rel.subReleases])
    .reduce((memo, { tracks }) => memo + tracks.length, 0);
}
