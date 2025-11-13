import type { MouseEvent } from "react";
import { useNavigate } from "react-router";
import { SearchResult } from "@/types/types";
import api from "@/renderer/api";
import ErrorView from "@/renderer/components/ErrorView";
import Loading from "@/renderer/components/Loading";
import useSearch from "@/renderer/query/useSearch";
import styles from "./QuickSearchView.module.css";
import List from "@/renderer/components/List";
import SearchResultView from "./SearchResultView";

type QuickSearchResultsProps = Pick<
  ReturnType<typeof useSearch>,
  "error" | "isPending"
> & {
  currentContext: string;
  setContext: (context: string) => void;
  onLinkClick: () => void;
  results: SearchResult[];
  listHandlers: {
    onUp: () => void;
  };
  onSelectionChange: (selection: number[]) => void;
};

export default function QuickSearchResults({
  error,
  isPending,
  results,
  onLinkClick,
  setContext,
  currentContext,
  listHandlers,
  onSelectionChange,
}: QuickSearchResultsProps) {
  const navigate = useNavigate();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (!results.length) {
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
    <div
      className={styles.searchResultsView}
      data-testid="QuickSearchResultsView"
    >
      <List
        onSelectionChange={onSelectionChange}
        disableMultipleSelection
        disableSelectionOnUp
        context={`modal:search:results(0)`}
        className={styles.listWrapper}
        items={results}
        estimateSize={() => ({
          width: 300,
          height: 64,
        })}
        paddingRight={0}
        gap={12}
        onEnter={onEnter}
        render={({ item, selected, onClick }) => (
          <SearchResultView
            index={0}
            currentContext={currentContext}
            item={item}
            selected={selected}
            onClick={(event: MouseEvent) => {
              setContext(`modal:search:results(0)`);
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
    </div>
  );
}
