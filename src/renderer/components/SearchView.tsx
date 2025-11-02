import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import {
  ArtistWithReleasesAndAppearances,
  SearchableEntities,
  SearchResult,
} from "@/types/types";
import { DEBOUNCE_INTERVAL } from "@/constants";
import { getCovers } from "@/lib/utils";
import api from "../api";
import useSearchInput from "../hooks/useSearchInput";
import useSearch from "../query/useSearch";

import ErrorView from "./ErrorView";
import Loading from "./Loading";
import Link from "./Link";
import Cover from "./Cover";
import SlidingCardsView from "./SlidingCardsView";
import ContextMenuButton from "./Buttons/ContextMenuButton";
import List from "./List";

import { Icon } from "../icons";
import cx from "clsx";
import styles from "./SearchView.module.css";

type SearchViewProps = {
  closeModal: () => void;
};

export default function SearchView({ closeModal }: SearchViewProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_INTERVAL, {
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
      <label>
        <Icon
          isFor="actions.search"
          aria-label={t("modals.SearchView.fields.search.label")}
        />
        <input
          autoFocus
          ref={inputRef}
          className={styles.input}
          type="search"
          placeholder={t("modals.SearchView.fields.search.placeholder")}
          {...inputHandlers}
        />
      </label>
      <SearchResultsView
        currentContext={currentContext}
        setContext={setContext}
        onLinkClick={closeModal}
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
  groupedResults: Partial<Record<SearchableEntities, SearchResult[]>>;
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
            {t(`entities.${type}`)}{" "}
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

type SearchResultViewProps = {
  index: number;
  currentContext: string;
  selected: boolean;
  item: SearchResult;
  onClick: (event: MouseEvent) => void;
  onDoubleClick: () => void;
  onPlaybackClick?: () => void;
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
  onDoubleClick,
  onPlaybackClick,
  onLinkClick,
}: SearchResultViewProps) {
  const { t } = useTranslation();
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
          playButtonClassName={styles.playbackButton}
          onDoubleClick={onDoubleClick}
          onPlaybackClick={onPlaybackClick}
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
            {t("modals.SearchView.results.trackBy")}{" "}
            {item.links.artist ? (
              <Link
                to={item.links.artist}
                className={styles.trackArtist}
                onClick={onLinkClick}
              >
                {artist}
              </Link>
            ) : (
              <span>{artist}</span>
            )}
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
      {item.type === "artist" ? (
        <SlidingCardsView
          className={styles.slidingCards}
          contentClassName={styles.slidingCardsContent}
          coverSize={64}
          coverGap={4}
          contentElement={
            <>
              <div className={styles.description}>{renderContent()}</div>
              <ContextMenuButton
                onClick={onContextMenu}
                className={styles.contextMenuButton}
              />
            </>
          }
        >
          {[
            ...getCovers({
              ...item,
              entityType: "artist",
            } as unknown as ArtistWithReleasesAndAppearances).otherReleases,
            coverRelease,
          ].map((release) => (
            <Cover
              key={release.id}
              {...release}
              className={styles.coverWrapper}
              playButtonClassName={styles.playbackButton}
              title={`${release.artist.name} - ${release.title}}`}
              onPlaybackClick={() =>
                api.system.playback({ release_id: release.id })
              }
            />
          ))}
        </SlidingCardsView>
      ) : (
        <>
          {renderCover()}
          <div className={styles.description}>{renderContent()}</div>
          <ContextMenuButton
            className={styles.contextMenuButton}
            onClick={onContextMenu}
          />
        </>
      )}
    </article>
  );
}
