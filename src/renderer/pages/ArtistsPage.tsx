import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import useArtists from "@/renderer/query/useArtists";
import { useSelect } from "@/renderer/hooks/useSelect";
import { getArtistLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import api from "@/renderer/api";
import useListView from "../hooks/useListView";
import useRestoreListPosition from "@/renderer/hooks/useRestoreListPosition";
import ErrorView from "@/renderer/components/ErrorView";
import Loading from "@/renderer/components/Loading";
import AlphabeticalList from "../components/AlphabeticalList";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";

import styles from "./Page.module.css";

export default function ArtistsPage() {
  const viewMode = useListView("artist");

  return (
    <div className={styles.page} data-testid="ArtistsPage">
      {viewMode === "alphabetical" ? (
        <AlphabeticalList entity="artist" columns={5} />
      ) : (
        <LatestArtistsView />
      )}
    </div>
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

  const { select } = useSelect("artist");

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return !artists?.length ? (
    <div className={styles.placeholder}>
      {t("placeholders.emptyList", { entity: "Artists" })}
    </div>
  ) : (
    <List
      shouldPreventSpace
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
      onSelectionChange={(selection) =>
        select(selection.map((index) => artists[index].id))
      }
      render={({ item, ...rest }) => (
        <ListCard
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
