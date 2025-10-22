import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import api from "@/renderer/api";
import { getGroupLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import useGroups from "@/renderer/query/useGroups";
import useRestoreListPosition from "@/renderer/hooks/useRestoreListPosition";
import { useSelect } from "../hooks/useSelect";
import { GroupWithArtists } from "@/types/types";
import Loading from "@/renderer/components/Loading";
import ErrorView from "@/renderer/components/ErrorView";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";

import styles from "./Page.module.css";

export default function LatestGroups() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPending, error, groups, deleteGroups } = useGroups();

  const { scrollInfo, storeScrollInfo } = useRestoreListPosition({
    key: ["latestGroups"],
  });

  const { select } = useSelect("group");

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  function onDelete(selection: GroupWithArtists[], event: KeyboardEvent) {
    if (!event.metaKey) {
      return;
    }
    deleteGroups(selection.map(({ id }) => id));
  }

  return (
    <div className={styles.page} data-testid="GroupsPage">
      {!groups?.length ? (
        <div className={styles.placeholder}>
          {t("placeholders.emptyList", {
            entity: "Groups",
          })}
        </div>
      ) : (
        <List
          shouldPreventSpace
          disableMultipleSelection
          items={groups}
          className={styles.list}
          columnsConfig={compactColumnsConfig}
          estimateSize={estimateListCardSize}
          onEnter={(group: GroupWithArtists) => navigate(getGroupLink(group))}
          onSelectionChange={(selection) =>
            select(selection.map((index) => groups[index].id))
          }
          onBackspace={onDelete}
          onUnmount={storeScrollInfo}
          scrollInfo={scrollInfo}
          testId="GroupsList"
          render={({ item, ...rest }) => (
            <ListCard
              showMultipleCovers
              item={item}
              onContextMenu={() => api.menu.group(item)}
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
