import { type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { SearchResult, ArtistWithReleasesAndAppearances } from "@/types/types";
import api from "@/renderer/api";
import { getCovers } from "@/lib/utils";
import ContextMenuButton from "../Buttons/ContextMenuButton";
import Link from "../Link";
import Cover from "../Cover";
import SlidingCardsView from "../SlidingCardsView";

import cx from "clsx";
import styles from "./SearchView.module.css";

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

export default function SearchResultView({
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
