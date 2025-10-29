import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import api from "@/renderer/api";
import { getCollectionLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import useListView from "../hooks/useListView";
import useCollections from "@/renderer/query/useCollections";
import useRestoreListPosition from "@/renderer/hooks/useRestoreListPosition";
import { useSelect } from "../hooks/useSelect";
import { CollectionWithReleases } from "@/types/types";
import Loading from "@/renderer/components/Loading";
import ErrorView from "@/renderer/components/ErrorView";
import AlphabeticalList from "../components/AlphabeticalList";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";

import styles from "./Page.module.css";

export default function CollectionsPage() {
  const viewMode = useListView("collection");
  return (
    <div className={styles.page} data-testid="CollectionsPage">
      {viewMode === "alphabetical" ? (
        <AlphabeticalList entity="collection" />
      ) : (
        <LatestCollectionsView />
      )}
    </div>
  );
}

function LatestCollectionsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPending, error, collections } = useCollections();

  const { scrollInfo, storeScrollInfo } = useRestoreListPosition({
    key: ["latestCollections"],
  });

  const { select } = useSelect("collection");

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return !collections?.length ? (
    <div className={styles.placeholder}>
      {t("placeholders.emptyList", { entity: "Collections" })}
    </div>
  ) : (
    <List
      shouldPreventSpace
      items={collections}
      className={styles.list}
      columnsConfig={compactColumnsConfig}
      estimateSize={estimateListCardSize}
      onEnter={(collection: CollectionWithReleases) =>
        navigate(getCollectionLink(collection))
      }
      onSelectionChange={(selection) =>
        select(selection.map((index) => collections[index].id))
      }
      onUnmount={storeScrollInfo}
      scrollInfo={scrollInfo}
      testId="CollectionsList"
      render={({ item, ...rest }) => (
        <ListCard
          item={item}
          onContextMenu={() => api.menu.collection(item)}
          onCoverDoubleClick={(release_id) =>
            api.system.playback({ release_id })
          }
          {...rest}
        />
      )}
    />
  );
}
