import { useNavigate } from "react-router";
import type {
  HasId,
  Release,
  ReleaseWithArtistAndSubreleases,
  ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import api from "../api";
import { releaseColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import {
  useKeyManager,
  withPrevent,
} from "@/renderer/hooks/useKeyboardManager";
import useReleases from "@/renderer/query/useReleases";
import { useClearSelectionOnLeave } from "@/renderer/hooks/ipc";
import useStore from "@/renderer/store";
import { getReleaseLink } from "@/lib/links";
import { getReleaseContextMenuParams } from "@/lib/utils";
import Loading from "@/renderer/components/Loading";
import ErrorView from "../components/ErrorView";
import List from "@/renderer/components/List";
import ReleaseView from "@/renderer/components/ReleaseView";

import styles from "./Page.module.css";

export default function LatestReleases() {
  const navigate = useNavigate();
  const { showSidebar, setModalContents } = useStore();
  const { setContext } = useKeyManager();
  const {
    releases,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    hideRelease,
  } = useReleases();

  useClearSelectionOnLeave();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  function onEnter(
    release: ReleaseWithArtistAndSubreleases,
    event: KeyboardEvent
  ) {
    if (event.metaKey) {
      api.system.playback({ release_id: release.id });
      return;
    }
    navigate(getReleaseLink(release));
  }

  const keyHandlers = {
    h: (_event: KeyboardEvent, selection: Release[]) =>
      hideRelease(selection[0].id),
    " ": withPrevent((_event: KeyboardEvent, selection: Release[]) => {
      setModalContents({
        name: "lightbox",
        params: {
          release: selection[0],
          context: releases,
        },
      });
    }),
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.header}>Releases</h1>
      {!releases?.length ? (
        <div className={styles.placeholder}>There are no releases yet.</div>
      ) : (
        <List
          shouldPreventSpace
          items={releases}
          className={styles.list}
          columnsConfig={releaseColumnsConfig}
          isInfinite
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onEnter={onEnter}
          onLeft={() => setContext("sidebar")}
          shouldCallOnLeft={() => showSidebar}
          onSelectionChange={(selection) =>
            api.state.selectReleases(selection.map((index) => releases[index]))
          }
          keyHandlers={keyHandlers}
          render={({ item, selection, ...rest }) => (
            <ReleaseView
              {...rest}
              release={item as ReleaseWithArtistAndTracksAndSubreleases}
              onContextMenu={() =>
                api.menu.release(
                  ...getReleaseContextMenuParams({
                    selection: selection.map((index) => releases[index]),
                    target_id: (item as HasId).id,
                    context: { releases },
                  })
                )
              }
            />
          )}
        />
      )}
    </div>
  );
}
