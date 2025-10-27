import { Navigate, useParams } from "react-router";
import useRelease from "@/renderer/query/useRelease";
import { useKeyManager } from "../hooks/useKeyboardManager";
import api from "../api";
import ReleaseWithTracklistView from "@/renderer/components/ReleaseWithTracklistView";
import ErrorView from "../components/ErrorView";
import Loading from "@/renderer/components/Loading";

import styles from "./Page.module.css";
import { useSelect } from "../hooks/useSelect";

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

  return (
    <div
      className={styles.page}
      onContextMenu={onContextMenu}
      data-testid="ReleasePage"
    >
      <ReleaseWithTracklistView
        isSingle
        release={release}
        selectedTrackId={selectedTrackId}
        hideSidebarInLightbox
      />
    </div>
  );
}
