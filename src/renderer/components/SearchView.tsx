import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "use-debounce";
import api from "../api";
import useSearchInput from "../hooks/useSearchInput";
import useSearch from "../query/useSearch";
import ErrorView from "./ErrorView";
import Loading from "./Loading";
import { SearchResult } from "@/types/types";
import Link from "./Link";
import Cover from "./Cover";
import List from "./List";
import cx from "clsx";
import styles from "./SearchView.module.css";

const DEBOUNCE_MS = 300;

type SearchViewProps = {
  onClose: () => void;
};

export default function SearchView({ onClose }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_MS, {
    leading: false,
  });

  const { isPending, error, results } = useSearch({
    take: 100,
    query: debouncedQuery,
    queryKey: ["search", debouncedQuery],
    queryFn: (query, take) =>
      api.searchResult.getSearchResults({
        query,
        take,
      }),
  });

  const groupedResults = Object.groupBy(results, ({ type }) => type);

  const { inputRef, inputHandlers, listHandlers, currentContext, setContext } =
    useSearchInput({ setQuery, resultTypes: Object.keys(groupedResults) });

  return (
    <div className={styles.view}>
      <header>
        <input
          autoFocus
          ref={inputRef}
          className={styles.input}
          type="search"
          placeholder="Search Library"
          {...inputHandlers}
        />
      </header>
      <SearchResultsView
        currentContext={currentContext}
        setContext={setContext}
        onLinkClick={onClose}
        isPending={isPending}
        groupedResults={groupedResults}
        error={error}
        listHandlers={listHandlers}
      />
    </div>
  );
}

type SearchResultsViewProps = Pick<
  ReturnType<typeof useSearch>,
  "error" | "isPending"
> & {
  groupedResults: Record<string, SearchResult[]>;
  currentContext: string;
  setContext: (context: string) => void;
  onLinkClick: () => void;
  listHandlers: {
    onUp: () => void;
  };
};

function SearchResultsView({
  currentContext,
  setContext,
  groupedResults,
  isPending,
  error,
  onLinkClick,
  listHandlers,
}: SearchResultsViewProps) {
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

  return (
    <div className={styles.searchResultsView}>
      {Object.entries(groupedResults).map(
        ([type, entries]: [string, SearchResult[]], index, groups) => (
          <section key={type}>
            <h3>
              {`${type}s`}{" "}
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
                setContext(
                  `modal:search:results(${(index + 1) % groups.length})`
                )
              }
              paddingRight={0}
              gap={12}
              onEnter={onEnter}
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
                  onContextMenu={() => api.menu.searchResult(item)}
                  onLinkClick={onLinkClick}
                />
              )}
              {...listHandlers}
            />
          </section>
        )
      )}
    </div>
  );
}

type SearchResultViewProps = {
  index: number;
  currentContext: string;
  selected: boolean;
  item: SearchResult;
  onClick: (event: MouseEvent) => void;
  onLinkClick: () => void;
  onContextMenu?: () => void;
};

function SearchResultView({
  index,
  currentContext,
  item,
  selected,
  onContextMenu,
  onClick,
  onLinkClick,
}: SearchResultViewProps) {
  const { title, type, artist, links, description, coverRelease } = item;

  function getTitle(): string {
    if (type === "release") {
      return `${artist} - ${title}`;
    }
    return title;
  }

  function getLink() {
    return links[type];
  }

  function renderCover() {
    if (type === "release" || coverRelease) {
      return (
        <Cover
          {...(type === "release"
            ? (item as SearchResult & { hash: string })
            : coverRelease)}
          className={styles.coverWrapper}
        />
      );
    }
    return <div className={styles.ghost}></div>;
  }

  function renderContent() {
    if (type === "track") {
      return (
        <>
          <Link to={getLink()} className={styles.title} onClick={onLinkClick}>
            {getTitle()}
          </Link>
          <span className={styles.type}>
            Track by{" "}
            <Link
              to={item.links.artist}
              className={styles.trackArtist}
              onClick={onLinkClick}
            >
              {artist}
            </Link>
          </span>
        </>
      );
    }
    return (
      <>
        <Link to={getLink()} className={styles.title} onClick={onLinkClick}>
          {getTitle()}
        </Link>
        <span className={styles.type}>{description}</span>
      </>
    );
  }

  return (
    <article
      onClick={onClick}
      className={cx(styles.listItem, {
        [styles.selected]: selected,
        [styles.hasFocus]:
          selected && currentContext === `modal:search:results(${index})`,
      })}
      onContextMenu={onContextMenu}
    >
      {renderCover()}
      <div className={styles.description}>{renderContent()}</div>
    </article>
  );
}
