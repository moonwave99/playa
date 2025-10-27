import { useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import useHover from "../hooks/useHover";
import {
  getReleaseTitle,
  getCoverRelease,
  withStopPropagation,
  normalizeArtistDisplayName,
  getColorInfo,
} from "@/lib/utils";
import {
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

import ReleaseInfo from "./ReleaseInfo";
import EntityList from "./EntityList";
import Cover from "./Cover";
import Link from "./Link";
import MultipleCovers, { type MultipleCoversProps } from "./MultipleCovers";

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
  onClick,
  onCoverClick,
  onContextMenu,
  showMultipleCovers,
  onCoverDoubleClick,
  onLinkClick,
  testId,
}: ListCardProps) {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const coverRelease = getCoverRelease(item);

  const { onMouseEnter, onMouseLeave, isHover } = useHover();

  const { darkText, color } = getColorInfo(coverRelease);

  function getContent() {
    if (item.entityType === "Release") {
      return (
        <>
          <EntityList
            textOnly
            context={item}
            itemClassName={styles.artist}
            useDarkText={darkText}
            canDeleteFirstEntry={false}
            items={[item.artist, ...item.additionalArtists]}
            onLinkClick={onLinkClick}
          />

          <Link
            className={styles.title}
            to={getReleaseLink(item)}
            title={`[${item.id}]`}
            onClick={onLinkClick}
          >
            {getReleaseTitle(item)}
          </Link>

          <ReleaseInfo
            release={item as ReleaseWithArtistAndTracksAndSubreleases}
            useDarkText={darkText}
            isInline
          />
        </>
      );
    }

    if (item.entityType === "Artist") {
      const releaseCount = item.releases.length + item.appearsIn.length;
      return (
        <header className={styles.header}>
          <Link
            className={styles.title}
            to={getArtistLink(item)}
            title={`[${item.id}]`}
          >
            {normalizeArtistDisplayName(item.name)}
          </Link>

          <div className={styles.info}>
            {t("components.ListCard.releaseCount", { count: releaseCount })}
          </div>
        </header>
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
    setLoaded(true);
  }

  function onError() {
    setLoaded(true);
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

  function getOnPlaybackClick() {
    if (item.entityType !== "Release") {
      return null;
    }
    return () => api.system.playback({ release_id: item.id });
  }

  const willDisplayMultipleCovers = shouldDisplayMultipleCovers();

  function renderCover() {
    if (willDisplayMultipleCovers) {
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
          onPlaybackClick={getOnPlaybackClick()}
        />
      );
    }

    return <div className={styles.ghost} />;
  }

  function getContextMenu() {
    if (!onContextMenu) {
      return null;
    }
    return withStopPropagation(onContextMenu);
  }

  return (
    <div
      data-selected={selected}
      data-hasfocus={selected && hasFocus}
      onMouseLeave={onMouseLeave}
      className={cx(styles.listCard, {
        [styles.loaded]: loaded,
        [styles.isArtist]: item.entityType === "Artist",
        [styles.selected]: selected,
        [styles.hasFocus]: selected && hasFocus,
        [styles.useDarkText]: darkText,
        [styles.isHover]: isHover,
        [styles.hasMultipleCovers]: willDisplayMultipleCovers,
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
