import { getReleaseContextMenuParams } from "@/lib/utils";
import {
  ReleaseWithArtistAndTracksAndSubreleases,
  HasId,
  ReleaseWithArtistAndSubReleases,
  Release,
} from "@/types/types";
import api from "../api";
import ErrorView from "../components/ErrorView";
import List from "../components/List";
import Loading from "../components/Loading";
import ReleaseView from "../components/ReleaseView";
import StatsView from "../components/StatsView";
import { releaseColumnsConfig } from "../hooks/useResponsiveColumns";
import useReleases from "../query/useReleases";
import styles from "./Page.module.css";
import { getReleaseLink } from "@/lib/links";
import { useNavigate } from "react-router";
import { withPrevent } from "../hooks/useKeyboardManager";
import useStore from "../store";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <LatestReleases />
      <StatsView />
    </div>
  );
}

function LatestReleases() {
  const navigate = useNavigate();
  const { setModalContents } = useStore();
  const { isPending, error, releases } = useReleases({ pageSize: 5 });
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
    <section className={styles.section}>
      <h2>Latest Releases</h2>
      {!releases?.length ? (
        <div className={styles.placeholder}>There are no releases yet.</div>
      ) : (
        <List
          shouldPreventSpace
          items={releases}
          className={styles.homepageList}
          columnsConfig={releaseColumnsConfig}
          onEnter={onEnter}
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
    </section>
  );
}
