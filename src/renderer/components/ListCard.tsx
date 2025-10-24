import { useState, useEffect, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import useDominantColor from "../hooks/useDominantColor";
import useHover from "../hooks/useHover";
import {
  getDiscInfo,
  getReleaseTitle,
  getCoverRelease,
  withStopPropagation,
  normalizeArtistDisplayName,
  getReleaseDuration,
} from "@/lib/utils";
import {
  getCover,
  getArtistLink,
  getReleaseLink,
  getCollectionLink,
  getGroupLink,
} from "@/lib/links";
import type {
  ArtistWithReleasesAndAppearances,
  ReleaseWithArtistAndSubReleases,
  ReleaseWithArtistAndTracksAndSubreleases,
  CollectionWithReleases,
  GroupWithArtists,
} from "@/types/types";

import api from "../api";

import EntityList from "./EntityList";
import Cover from "./Cover";
import Link from "./Link";
import RelatedArtistsList from "./RelatedArtistsList";
import ContainingCollectionsList from "./ContainingCollectionsList";
import ContainingGroupsList from "./ContainingGroupsList";

import cx from "clsx";
import styles from "./ListCard.module.css";

export type Item =
  | CollectionWithReleases
  | ArtistWithReleasesAndAppearances
  | ReleaseWithArtistAndSubReleases
  | ReleaseWithArtistAndTracksAndSubreleases
  | GroupWithArtists;

type ListCardProps = {
  item: Item;
  className?: string;
  selected?: boolean;
  hasFocus?: boolean;
  isSingle?: boolean;
  hideCover?: boolean;
  onClick?: (event: MouseEvent) => void;
  onCoverClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: () => void;
  onColorChange?: (useDarkText: boolean) => void;
  showMultipleCovers?: boolean;
  onCoverDoubleClick?: (release_id: number) => void;
  onLinkClick?: () => void;
  testId?: string;
};

export default function ListCard({
  item,
  className = "",
  selected,
  hasFocus,
  isSingle,
  hideCover,
  onClick,
  onCoverClick,
  onContextMenu,
  onColorChange,
  showMultipleCovers,
  onCoverDoubleClick,
  onLinkClick,
  testId,
}: ListCardProps) {
  const { t } = useTranslation();
  const [loadCount, setLoadCount] = useState(0);
  const coverRelease = getCoverRelease(item);

  const { color, useDarkText, loaded, fromCache } = useDominantColor(
    coverRelease ? getCover(coverRelease.hash) : null,
    loadCount,
    hideCover
  );

  useEffect(() => {
    if (!onColorChange) {
      return;
    }
    onColorChange(useDarkText);
    return () => onColorChange(false);
  }, [useDarkText]);

  const { onMouseEnter, onMouseLeave, isHover } = useHover();

  function getContent() {
    if (item.entityType === "Release") {
      return (
        <>
          <EntityList
            context={item}
            itemClassName={styles.artist}
            useDarkText={useDarkText}
            canDeleteFirstEntry={false}
            items={[item.artist, ...item.additionalArtists]}
            onLinkClick={onLinkClick}
            onDelete={(artist_id) =>
              api.release.removeAdditionalArtist({
                release_id: item.id,
                artist_id,
              })
            }
          />
          {isSingle ? (
            <span className={styles.title} title={`[${item.id}]`}>
              {getReleaseTitle(item)}
            </span>
          ) : (
            <Link
              className={styles.title}
              to={getReleaseLink(item)}
              title={`[${item.id}]`}
              onClick={onLinkClick}
            >
              {getReleaseTitle(item)}
            </Link>
          )}
          <ReleaseInfo
            release={item as ReleaseWithArtistAndTracksAndSubreleases}
            isSingle={isSingle}
            isInline={!hideCover}
            useDarkText={useDarkText}
            onLinkClick={onLinkClick}
          />
        </>
      );
    }

    if (item.entityType === "Artist") {
      const releaseCount = isSingle
        ? item.releases.length
        : item.releases.length + item.appearsIn.length;
      return (
        <>
          <header className={styles.header}>
            {isSingle ? (
              <span className={styles.title} title={`[${item.id}]`}>
                {normalizeArtistDisplayName(item.name)}
              </span>
            ) : (
              <Link
                className={styles.title}
                to={getArtistLink(item)}
                title={`[${item.id}]`}
              >
                {normalizeArtistDisplayName(item.name)}
              </Link>
            )}
            <div className={styles.info}>
              {t("components.ListCard.releaseCount", { count: releaseCount })}
            </div>
          </header>
          {isSingle && (
            <div className={styles.listInfo}>
              <RelatedArtistsList
                useDarkText={useDarkText}
                id={item.id}
                className={styles.entityList}
                itemClassName={styles.entityListEntry}
              />
              <ContainingGroupsList
                useDarkText={useDarkText}
                id={item.id}
                className={styles.entityList}
                itemClassName={styles.entityListEntry}
              />
            </div>
          )}
        </>
      );
    }

    if (item.entityType === "Group") {
      return (
        <>
          <Link
            className={styles.title}
            to={getGroupLink(item)}
            title={`[${item.id}]`}
          >
            {item.title}
          </Link>
          <div className={styles.info}>{item.artists.length} artists</div>
        </>
      );
    }

    return (
      <>
        <Link
          className={styles.title}
          to={getCollectionLink(item)}
          title={`[${item.id}]`}
        >
          {item.title}
        </Link>
        <div className={styles.info}>{item.releases.length} releases</div>
      </>
    );
  }

  function onLoad() {
    setLoadCount((prev) => prev + 1);
  }

  function onError() {
    setLoadCount((prev) => prev + 1);
  }

  function shouldDisplayMultipleCovers() {
    if (!showMultipleCovers || item.entityType === "Release") {
      return false;
    }
    if (item.entityType === "Group") {
      return item.artists.length > 1;
    }
    if (item.entityType === "Artist") {
      return item.releases.length + item.appearsIn.length > 1;
    }
    return item.releases.length > 1;
  }

  function renderCover() {
    if (hideCover) {
      return null;
    }

    if (shouldDisplayMultipleCovers()) {
      return (
        <MultipleCovers
          item={item as MultipleCoversProps["item"]}
          onLoad={onLoad}
          onError={onError}
          onCoverDoubleClick={onCoverDoubleClick}
          onMouseEnter={onMouseEnter}
          isHover={isHover}
        />
      );
    }

    if (coverRelease) {
      return (
        <Cover
          {...coverRelease}
          onClick={onCoverClick}
          className={styles.cover}
          title={`${coverRelease?.artist?.name} - ${getReleaseTitle(
            coverRelease
          )}`}
          onLoad={onLoad}
          onError={onError}
        />
      );
    }

    return <div className={styles.ghost} />;
  }

  function getContextMenu() {
    if (!onContextMenu) {
      return null;
    }
    return isSingle ? onContextMenu : withStopPropagation(onContextMenu);
  }

  return (
    <div
      data-selected={selected}
      data-hasfocus={selected && hasFocus}
      onMouseLeave={onMouseLeave}
      className={cx(styles.listCard, {
        [styles.loaded]: loaded,
        [styles.isArtist]: item.entityType === "Artist",
        [styles.isSingle]: isSingle,
        [styles.selected]: selected,
        [styles.hasFocus]: selected && hasFocus,
        [styles.useDarkText]: useDarkText,
        [styles.isHover]: isHover,
        [styles.hideCover]: hideCover,
        [styles.fromCache]: fromCache,
        className,
      })}
      onClick={onClick}
      onContextMenu={getContextMenu()}
      style={{ background: color || null }}
      data-testid={testId}
    >
      {renderCover()}
      <div className={styles.content}>{getContent()}</div>
    </div>
  );
}

type MultipleCoversProps = {
  item:
    | CollectionWithReleases
    | ArtistWithReleasesAndAppearances
    | GroupWithArtists;
  count?: number;
  isHover: boolean;
  onLoad: () => void;
  onError: () => void;
  onCoverDoubleClick?: (release_id: number) => void;
  onMouseEnter: () => void;
};

function MultipleCovers({
  item,
  count = 5,
  isHover,
  onLoad,
  onError,
  onCoverDoubleClick,
  onMouseEnter,
}: MultipleCoversProps) {
  const { coverRelease, otherReleases } = getCovers(item, count);

  return (
    <div
      onMouseEnter={onMouseEnter}
      className={cx(styles.multipleCovers, { [styles.isHover]: isHover })}
    >
      <>
        {otherReleases.map((release) => (
          <Cover
            key={release.id}
            {...release}
            className={styles.cover}
            title={`${release.artist.name} - ${getReleaseTitle(release)}`}
            onDoubleClick={() => onCoverDoubleClick(release.id)}
          />
        ))}
        <Cover
          {...coverRelease}
          className={styles.cover}
          title={`${coverRelease.artist.name} - ${getReleaseTitle(
            coverRelease
          )}`}
          onLoad={onLoad}
          onError={onError}
          onDoubleClick={() => onCoverDoubleClick(coverRelease.id)}
        />
      </>
    </div>
  );
}

type GetCovers = {
  coverRelease: ReleaseWithArtistAndSubReleases;
  otherReleases: ReleaseWithArtistAndSubReleases[];
};

function getCovers(item: MultipleCoversProps["item"], count = 5): GetCovers {
  const coverRelease = getCoverRelease(item);

  let otherReleases: ReleaseWithArtistAndSubReleases[];

  if (item.entityType === "Group") {
    otherReleases = item.artists.map(getCoverRelease);
  } else if (item.entityType === "Artist") {
    otherReleases = [
      ...item.releases,
      ...item.appearsIn,
    ] as ReleaseWithArtistAndSubReleases[];
  } else {
    otherReleases = item.releases;
  }

  return {
    coverRelease,
    otherReleases: otherReleases
      .filter((x) => x.id !== coverRelease.id)
      .slice(0, count - 1),
  };
}

type ReleaseInfoProps = {
  release: ReleaseWithArtistAndTracksAndSubreleases;
  isSingle: boolean;
  isInline: boolean;
  useDarkText: boolean;
  onLinkClick?: () => void;
};

function ReleaseInfo({
  release,
  isSingle,
  isInline = true,
  useDarkText,
  onLinkClick,
}: ReleaseInfoProps) {
  const { t } = useTranslation();
  const { id, type, year } = release;
  const { duration, trackCount } = getReleaseDuration(release);
  return (
    <div className={cx(styles.info, { [styles.isInline]: isInline })}>
      <span>
        {type}, {year} {getDiscInfo(release)}
        {isSingle && (
          <>
            <span className={styles.trackCount}>
              {t("components.ListCard.trackCount", { count: trackCount })}
            </span>
            <span
              className={cx(styles.releaseDuration, {
                [styles.releaseDurationBlock]: !isInline && isSingle,
              })}
            >
              {duration}
            </span>
          </>
        )}
      </span>
      {isSingle && (
        <ContainingCollectionsList
          className={styles.entityList}
          itemClassName={styles.entityListEntry}
          useDarkText={useDarkText}
          onLinkClick={onLinkClick}
          id={id}
        />
      )}
    </div>
  );
}
