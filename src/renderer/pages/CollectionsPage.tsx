import { useNavigate } from "react-router";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import api from "../api";
import { getCollectionLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import useCollections from "@/renderer/query/useCollections";
import useRestoreListPosition from "@/renderer/hooks/useRestoreListPosition";
import { CollectionWithReleases } from "@/types/types";
import Loading from "@/renderer/components/Loading";
import ErrorView from "../components/ErrorView";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";

import styles from "./Page.module.css";

export default function LatestCollections() {
  const navigate = useNavigate();
  const { isPending, error, collections, deleteCollections } = useCollections();

  const { scrollInfo, storeScrollInfo } = useRestoreListPosition({
    key: ["latestCollections"],
  });

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  function onDelete(selection: CollectionWithReleases[], event: KeyboardEvent) {
    if (!event.metaKey) {
      return;
    }
    deleteCollections(selection.map(({ id }) => id));
  }

  return (
    <div className={styles.page}>
      {!collections?.length ? (
        <div className={styles.placeholder}>There are no Collections yet.</div>
      ) : (
        <List
          shouldPreventSpace
          disableMultipleSelection
          items={collections}
          className={styles.list}
          columnsConfig={compactColumnsConfig}
          estimateSize={estimateListCardSize}
          onEnter={(collection: CollectionWithReleases) =>
            navigate(getCollectionLink(collection))
          }
          onBackspace={onDelete}
          onUnmount={storeScrollInfo}
          scrollInfo={scrollInfo}
          render={({ item, ...rest }) => (
            <ListCard
              showMultipleCovers
              item={item}
              onContextMenu={() => api.menu.collection(item)}
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
