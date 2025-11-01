import { useTranslation } from "react-i18next";
import type {
  HasId,
  ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import api from "@/renderer/api";
import { useReleaseLightbox } from "@/renderer/hooks/useReleaseLightbox";
import { withPrevent } from "@/renderer/hooks/useKeyboardManager";
import useRestoreListPosition from "@/renderer/hooks/useRestoreListPosition";
import { releaseColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import useReleases from "@/renderer/query/useReleases";
import { useSelect } from "@/renderer/hooks/useSelect";
import { getReleaseContextMenuParams } from "@/lib/utils";
import Loading from "@/renderer/components/Loading";
import ErrorView from "@/renderer/components/ErrorView";
import List from "@/renderer/components/List";
import ReleaseView from "@/renderer/components/ReleaseView";

import styles from "./Page.module.css";

export default function ReleasesPage() {
  const { t } = useTranslation();

  const {
    releases,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useReleases();

  const { openLightbox, ref } = useReleaseLightbox({
    context: releases,
  });

  const { select } = useSelect("release");

  const { scrollInfo, storeScrollInfo } = useRestoreListPosition({
    key: ["latestReleases"],
  });

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <div className={styles.page} data-testid="ReleasesPage">
      {!releases?.length ? (
        <div className={styles.placeholder}>
          {t("placeholders.emptyList", { entity: "Releases" })}
        </div>
      ) : (
        <List
          ref={ref}
          onUnmount={storeScrollInfo}
          shouldPreventSpace
          items={releases}
          className={styles.list}
          columnsConfig={releaseColumnsConfig}
          isInfinite
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onSelectionChange={(selection) =>
            select(selection.map((index) => releases[index].id))
          }
          scrollInfo={scrollInfo}
          keyHandlers={{
            " ": withPrevent((_, selection: HasId[]) =>
              openLightbox(selection)
            ),
          }}
          testId="ReleaseList"
          render={({ item, selection, ...rest }) => (
            <ReleaseView
              {...rest}
              release={item as ReleaseWithArtistAndTracksAndSubreleases}
              onContextMenu={() =>
                api.menu.release(
                  ...getReleaseContextMenuParams({
                    selection: selection.map((index) => releases[index]),
                    target_id: (item as HasId).id,
                    context: { releases, entityType: null },
                  })
                )
              }
            />
          )}
        />
      )}
    </div>
  );
}
