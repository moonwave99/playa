import { useNavigate } from "react-router";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import useArtists from "@/renderer/query/useArtists";
import api from "../api";
import { getArtistLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import ErrorView from "@/renderer/components/ErrorView";
import Loading from "@/renderer/components/Loading";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";

import styles from "./Page.module.css";

export default function ArtistsPage() {
  const navigate = useNavigate();
  const {
    artists,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useArtists();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <div className={styles.page}>
      {!artists?.length ? (
        <div className={styles.placeholder}>There are no artists yet.</div>
      ) : (
        <List
          shouldPreventSpace
          disableMultipleSelection
          items={artists}
          className={styles.list}
          estimateSize={estimateListCardSize}
          isInfinite
          columnsConfig={compactColumnsConfig}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onEnter={(artist) => navigate(getArtistLink(artist))}
          render={({ item, ...rest }) => (
            <ListCard
              showMultipleCovers
              item={item}
              onContextMenu={() => api.menu.artist(item)}
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
