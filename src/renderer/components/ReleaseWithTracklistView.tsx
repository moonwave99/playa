import type { MouseEvent } from "react";
import api from "../api";
import { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";
import Tracklist from "./Tracklist";
import ListCard from "./ListCard";
import { withStopPropagation } from "@/lib/utils";
import useStore from "../store";
import cx from "clsx";
import styles from "./ReleaseWithTracklistView.module.css";

type ReleaseWithTracklistViewProps = {
  selected?: boolean;
  hasFocus?: boolean;
  hideSidebarInLightbox?: boolean;
  className?: string;
  release: ReleaseWithArtistAndTracksAndSubreleases;
  selectedTrackId?: number;
  context?: string;
  onContextMenu?: (
    selection: ReleaseWithArtistAndTracksAndSubreleases[],
    target_id: number
  ) => void;
  onClick?: (event: MouseEvent) => void;
  onLinkClick?: () => void;
};

export default function ReleaseWithTracklistView({
  selected,
  hasFocus,
  hideSidebarInLightbox = false,
  className = "",
  release,
  selectedTrackId,
  context = "list",
  onContextMenu,
  onClick,
  onLinkClick,
}: ReleaseWithTracklistViewProps) {
  const { id } = release;
  const { setModalContents } = useStore();

  function onDiscContextMenu(id: number) {
    const foundRelease = [release, ...release.subReleases].find(
      (x) => x.id === id
    );
    api.menu.release([{ ...foundRelease, artist: release.artist }]);
  }

  return (
    <article
      className={cx(styles.releaseView, className)}
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
        onLinkClick={onLinkClick}
        onCoverClick={() =>
          setModalContents({
            name: "lightbox",
            params: { release, hideSidebar: hideSidebarInLightbox },
          })
        }
        testId="ReleaseWithTracklistHeader"
      />
      <Tracklist
        release={release}
        selectedTrackId={selectedTrackId}
        context={context}
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
