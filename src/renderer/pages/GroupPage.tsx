import { useParams, Navigate } from "react-router";
import { useTranslation } from "react-i18next";
import api from "@/renderer/api";
import useGroup from "../query/useGroup";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import { useSelect } from "@/renderer/hooks/useSelect";
import { estimateListCardSize } from "@/lib/utils";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";
import Loading from "@/renderer/components/Loading";
import ErrorView from "../components/ErrorView";

import styles from "./Page.module.css";

export default function GroupPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { group, isPending, error } = useGroup(+id);

  const { select } = useSelect("artist");
  useSelect("group", [+id]);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (!group) {
    return <Navigate replace to="/groups" />;
  }

  return (
    <div className={styles.page} data-testid="GroupPage">
      {!group?.artists.length ? (
        <div className={styles.placeholder}>
          {t("placeholders.emptyListForContainer", {
            entity: "Artists",
            container: "Group",
          })}
        </div>
      ) : (
        <List
          shouldPreventSpace
          items={group.artists}
          className={styles.list}
          columnsConfig={compactColumnsConfig}
          estimateSize={estimateListCardSize}
          onSelectionChange={(selection) =>
            select(selection.map((index) => group.artists[index].id))
          }
          testId="ArtistList"
          render={({ item, ...rest }) => (
            <ListCard
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
