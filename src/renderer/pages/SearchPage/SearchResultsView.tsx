import { type MouseEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { SearchableEntities, SearchResult } from "@/types/types";
import api from "@/renderer/api";
import useSearch from "@/renderer/query/useSearch";
import ErrorView from "../../components/ErrorView";
import List from "../../components/List";
import Loading from "../../components/Loading";
import SearchResultView from "./SearchResultView";
import styles from "./SearchPage.module.css";

type SearchResultsViewProps = Pick<
  ReturnType<typeof useSearch>,
  "error" | "isPending"
> & {
  groupedResults: Partial<Record<SearchableEntities, SearchResult[]>>;
  currentContext: string;
  setContext: (context: string) => void;
  listHandlers: {
    onUp: () => void;
  };
  baseContext?: string;
};

export default function SearchResultsView({
  currentContext,
  setContext,
  groupedResults,
  isPending,
  error,
  listHandlers,
  baseContext = "modal",
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
            context={`${baseContext}:search:results(${index})`}
            className={styles.listWrapper}
            items={entries}
            estimateSize={() => ({
              width: 300,
              height: 64,
            })}
            onLeft={() =>
              setContext(
                `${baseContext}:search:results(${index === 0 ? groups.length - 1 : index - 1})`
              )
            }
            onRight={() =>
              setContext(
                `${baseContext}:search:results(${(index + 1) % groups.length})`
              )
            }
            paddingRight={0}
            gap={12}
            onEnter={onEnter}
            testId={`SearchResultsView-${type}`}
            render={({ item, selected, onClick }) => (
              <SearchResultView
                baseContext={baseContext}
                index={index}
                currentContext={currentContext}
                item={item}
                selected={selected}
                onClick={(event: MouseEvent) => {
                  setContext(`${baseContext}:search:results(${index})`);
                  onClick(event);
                }}
                onDoubleClick={() => playbackItem(item)}
                onPlaybackClick={getOnPlaybackClick(item)}
                onContextMenu={() => api.menu.searchResult(item)}
              />
            )}
            {...listHandlers}
          />
        </section>
      ))}
    </div>
  );
}
