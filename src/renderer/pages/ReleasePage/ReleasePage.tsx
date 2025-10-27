import { Navigate, useParams } from "react-router";
import useRelease from "@/renderer/query/useRelease";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import { useSelect } from "@/renderer/hooks/useSelect";
import api from "@/renderer/api";

import ReleasePageHeader from "./ReleasePageHeader";
import Tracklist from "@/renderer/components/Tracklist";
import ErrorView from "@/renderer/components/ErrorView";
import Loading from "@/renderer/components/Loading";

import cx from "clsx";
import styles from "../Page.module.css";

export default function ReleasePage() {
  const { id } = useParams();

  const { isPending, error, release, selectedTrackId, gotoArtistPage } =
    useRelease({
      id: +id,
      refreshOnLoad: true,
    });

  useKeyManager({
    context: "list:release",
    handlers: {
      a: gotoArtistPage,
    },
  });

  useSelect("release", [+id]);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (!release) {
    return <Navigate replace to="/" />;
  }

  function onContextMenu() {
    api.menu.release([release]);
  }

  function onDiscContextMenu(id: number) {
    const foundRelease = [release, ...release.subReleases].find(
      (x) => x.id === id
    );
    api.menu.release([{ ...foundRelease, artist: release.artist }]);
  }

  return (
    <div
      className={cx(styles.page, styles.singlePage)}
      onContextMenu={onContextMenu}
      data-testid="ReleasePage"
    >
      <ReleasePageHeader release={release} />
      <Tracklist
        isFlipped
        release={release}
        selectedTrackId={selectedTrackId}
        isNavigable
        onContextMenu={onDiscContextMenu}
        onDoubleClick={(track_id) =>
          api.system.playback({
            release_id: release.id,
            track_id,
          })
        }
      />
    </div>
  );
}
