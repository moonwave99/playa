import { useNavigate } from "react-router";
import type {
  HasId,
  Release,
  ReleaseWithArtistAndSubReleases,
  ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import api from "@/renderer/api";
import useStore from "@/renderer/store";
import { releaseColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import { withPrevent } from "@/renderer/hooks/useKeyboardManager";
import useReleases from "@/renderer/query/useReleases";
import { useClearSelectionOnLeave } from "@/renderer/hooks/useApi";
import { getReleaseLink } from "@/lib/links";
import { getReleaseContextMenuParams } from "@/lib/utils";
import Loading from "@/renderer/components/Loading";
import ErrorView from "../components/ErrorView";
import List from "@/renderer/components/List";
import ReleaseView from "@/renderer/components/ReleaseView";

import styles from "./Page.module.css";

export default function ReleasesPage() {
  const navigate = useNavigate();
  const { setModalContents } = useStore();
  const {
    releases,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useReleases();

  useClearSelectionOnLeave();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  function onEnter(
    release: ReleaseWithArtistAndSubReleases,
    event: KeyboardEvent
  ) {
    if (event.metaKey) {
      api.system.playback({ release_id: release.id });
      return;
    }
    navigate(getReleaseLink(release));
  }

  const keyHandlers = {
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
