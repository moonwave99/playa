import { type MouseEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { SearchableEntities, SearchResult } from "@/types/types";
import api from "@/renderer/api";
import useSearch from "@/renderer/query/useSearch";
import ErrorView from "@/renderer/components/ErrorView";
import List from "@/renderer/components/List";
import Loading from "@/renderer/components/Loading";
import SearchResultView from "./SearchResultView";
import styles from "./QuickSearchView.module.css";

type SearchResultsViewProps = Pick<
  ReturnType<typeof useSearch>,
  "error" | "isPending"
> & {
  groupedResults: Partial<Record<SearchableEntities, SearchResult[]>>;
  currentContext: string;
  setContext: (context: string) => void;
  onLinkClick: () => void;
  listHandlers: {
    onUp: () => void;
  };
};

export default function SearchResultsView({
  currentContext,
  setContext,
  groupedResults,
  isPending,
  error,
  onLinkClick,
  listHandlers,
}: SearchResultsViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (!Object.keys(groupedResults).length) {
    return null;
  }

  function onEnter(item: SearchResult, event: KeyboardEvent) {
    if (item.type === "release" && event.metaKey) {
      api.system.playback({ release_id: item.id });
      return;
    }
    if (item.type === "track" && event.metaKey) {
      api.system.playback({
        release_id: item.coverRelease.id,
        track_id: item.id,
      });
      return;
    }
    navigate(item.links[item.type]);
    onLinkClick();
  }

  function playbackItem(item: SearchResult) {
    if (item.type === "release") {
      api.system.playback({ release_id: item.id });
      return;
    }
    if (item.type === "track") {
      api.system.playback({
        release_id: item.coverRelease.id,
        track_id: item.id,
      });
    }
  }

  function getOnPlaybackClick(item: SearchResult) {
    if (item.type !== "release" && item.type !== "track") {
      return null;
    }
    return () => playbackItem(item);
  }

  return (
    <div className={styles.searchResultsView} data-testid="SearchResultsView">
      {Object.entries(groupedResults).map(([type, entries], index, groups) => (
        <section key={type}>
          <h3>
            {t(`common.entities.${type}`)}{" "}
            <span className={styles.count}>({entries.length})</span>
          </h3>
          <List
            disableMultipleSelection
            context={`modal:search:results(${index})`}
            className={styles.listWrapper}
            items={entries}
            estimateSize={() => ({
              width: 300,
              height: 64,
            })}
            onLeft={() =>
              setContext(
                `modal:search:results(${index === 0 ? groups.length - 1 : index - 1})`
              )
            }
            onRight={() =>
              setContext(`modal:search:results(${(index + 1) % groups.length})`)
            }
            paddingRight={0}
            gap={12}
            onEnter={onEnter}
            testId={`SearchResultsView-${type}`}
            render={({ item, selected, onClick }) => (
              <SearchResultView
                index={index}
                currentContext={currentContext}
                item={item}
                selected={selected}
                onClick={(event: MouseEvent) => {
                  setContext(`modal:search:results(${index})`);
                  onClick(event);
                }}
                onDoubleClick={() => playbackItem(item)}
                onPlaybackClick={getOnPlaybackClick(item)}
                onContextMenu={() => api.menu.searchResult(item)}
                onLinkClick={onLinkClick}
              />
            )}
            {...listHandlers}
          />
        </section>
      ))}
    </div>
  );
}
