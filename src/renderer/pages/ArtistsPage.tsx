import { useNavigate } from "react-router";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import useArtists from "@/renderer/query/useArtists";
import useAlphabeticalArtists from "@/renderer/query/useAlphabeticalArtists";
import { useApi } from "@/renderer/hooks/useApi";
import api from "../api";
import { getArtistLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import ErrorView from "@/renderer/components/ErrorView";
import Loading from "@/renderer/components/Loading";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";
import AlphabeticalList from "../components/AlphabeticalList";

import styles from "./Page.module.css";
import useStore from "../store";
import useRestoreListPosition from "../hooks/useRestoreListPosition";

export default function ArtistsPage() {
  const { artistsViewMode, toggleViewMode } = useStore();

  useApi({
    onToggleViewMode: () => toggleViewMode("artists"),
  });

  return (
    <div className={styles.page}>
      {artistsViewMode === "alphabetical" ? (
        <AlphabeticalArtistsView />
      ) : (
        <LatestArtistsView />
      )}
    </div>
  );
}

function AlphabeticalArtistsView() {
  const { artists, error, isPending } = useAlphabeticalArtists();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return !artists.length ? (
    <div className={styles.placeholder}>There are no Artists yet.</div>
  ) : (
    <AlphabeticalList items={artists} />
  );
}

function LatestArtistsView() {
  const navigate = useNavigate();
  const {
    artists,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useArtists();

  const { scrollInfo, storeScrollInfo } = useRestoreListPosition({
    key: ["latestArtists"],
  });

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return !artists?.length ? (
    <div className={styles.placeholder}>There are no Artists yet.</div>
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
      onUnmount={storeScrollInfo}
      scrollInfo={scrollInfo}
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
  );
}
