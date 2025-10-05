import { useParams, Navigate, useNavigate } from "react-router";
import api from "../api";
import type { ArtistWithReleasesAndAppearances } from "@/types/types";
import useGroup from "../query/useGroup";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import { useClearSelectionOnLeave } from "@/renderer/hooks/useApi";
import { getArtistLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import List from "../components/List";
import ListCard from "../components/ListCard";
import Loading from "@/renderer/components/Loading";
import ErrorView from "../components/ErrorView";

import styles from "./Page.module.css";

export default function GroupPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { group, isPending, error, removeArtistsFromGroup } = useGroup(+id);

  useClearSelectionOnLeave();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (!group) {
    return <Navigate replace to="/groups" />;
  }

  function onDelete(
    selection: ArtistWithReleasesAndAppearances[],
    event: KeyboardEvent
  ) {
    if (!event.metaKey) {
      return;
    }
    removeArtistsFromGroup(selection);
  }

  return (
    <div className={styles.page} data-testid="GroupPage">
      {!group?.artists.length ? (
        <div className={styles.placeholder}>
          There are no Artists in this Group yet.
        </div>
      ) : (
        <List
          shouldPreventSpace
          items={group.artists}
          className={styles.list}
          columnsConfig={compactColumnsConfig}
          estimateSize={estimateListCardSize}
          onEnter={(artist: ArtistWithReleasesAndAppearances) =>
            navigate(getArtistLink(artist))
          }
          onBackspace={onDelete}
          render={({ item, ...rest }) => (
            <ListCard
              showMultipleCovers
              item={item}
              onContextMenu={() => api.menu.artist(item, group)}
              onCoverDoubleClick={(release_id) =>
                api.system.playback({ release_id })
              }
              {...rest}
            />
          )}
        />
      )}
    </div>
  );
}
