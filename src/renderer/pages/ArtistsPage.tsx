import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import useArtists from "@/renderer/query/useArtists";
import useAlphabeticalArtists from "@/renderer/query/useAlphabeticalArtists";
import { useApiEvents } from "@/renderer/hooks/useApiEvents";
import api from "@/renderer/api";
import useStore from "@/renderer/store";
import useRestoreListPosition from "@/renderer/hooks/useRestoreListPosition";
import { getArtistLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import ErrorView from "@/renderer/components/ErrorView";
import Loading from "@/renderer/components/Loading";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";
import AlphabeticalList from "../components/AlphabeticalList";

import styles from "./Page.module.css";

export default function ArtistsPage() {
  const { artistsViewMode, toggleViewMode } = useStore();

  useApiEvents({
    onToggleViewMode: () => toggleViewMode("artists"),
  });

  return (
    <div className={styles.page} data-testid="ArtistsPage">
      {artistsViewMode === "alphabetical" ? (
        <AlphabeticalArtistsView />
      ) : (
        <LatestArtistsView />
      )}
    </div>
  );
}

function AlphabeticalArtistsView() {
  const { t } = useTranslation();
  const { artists, error, isPending } = useAlphabeticalArtists();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return !artists.length ? (
    <div className={styles.placeholder} data-testid="ArtistsPage">
      {t("placeholders.emptyList", { artist: "Artists" })}
    </div>
  ) : (
    <AlphabeticalList items={artists} />
  );
}

function LatestArtistsView() {
  const { t } = useTranslation();
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
    <div className={styles.placeholder}>
      {t("placeholders.emptyList", { artist: "Artists" })}
    </div>
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
      testId="LatestArtistsView"
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
