import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import api from "@/renderer/api";
import { getGroupLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import useListView from "../hooks/useListView";
import useGroups from "@/renderer/query/useGroups";
import useRestoreListPosition from "@/renderer/hooks/useRestoreListPosition";
import { useSelect } from "../hooks/useSelect";
import { GroupWithArtists } from "@/types/types";
import AlphabeticalList from "../components/AlphabeticalList";
import Loading from "@/renderer/components/Loading";
import ErrorView from "@/renderer/components/ErrorView";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";

import styles from "./Page.module.css";

export default function GroupsPage() {
  const viewMode = useListView("group");
  return (
    <div className={styles.page} data-testid="GroupsPage">
      {viewMode === "alphabetical" ? (
        <AlphabeticalList entity="group" />
      ) : (
        <LatestGroupsView />
      )}
    </div>
  );
}

function LatestGroupsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPending, error, groups } = useGroups();

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

  return !groups?.length ? (
    <div className={styles.placeholder}>
      {t("placeholders.emptyList", {
        entity: "Groups",
      })}
    </div>
  ) : (
    <List
      shouldPreventSpace
      items={groups}
      className={styles.list}
      columnsConfig={compactColumnsConfig}
      estimateSize={estimateListCardSize}
      onEnter={(group: GroupWithArtists) => navigate(getGroupLink(group))}
      onSelectionChange={(selection) =>
        select(selection.map((index) => groups[index].id))
      }
      onUnmount={storeScrollInfo}
      scrollInfo={scrollInfo}
      testId="GroupsList"
      render={({ item, ...rest }) => (
        <ListCard
          item={item}
          onContextMenu={() => api.menu.group(item)}
          onCoverDoubleClick={(release_id) =>
            api.system.playback({ release_id })
          }
          {...rest}
        />
      )}
    />
  );
}
