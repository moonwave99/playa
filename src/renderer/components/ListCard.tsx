import { type MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import {
  getReleaseTitle,
  withStopPropagation,
  normalizeArtistDisplayName,
  getColorInfo,
  getCovers,
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

import useStore from "../store";
import api from "../api";

import SlidingCardsView from "./SlidingCardsView";
import ReleaseInfo from "./ReleaseInfo";
import EntityList from "./EntityList";
import Cover from "./Cover";
import Link from "./Link";
import ContextMenuButton from "./Buttons/ContextMenuButton";

import cx from "clsx";
import styles from "./ListCard.module.css";

export type Item =
  | CollectionWithReleases
  | ArtistWithReleasesAndAppearances
  | GroupWithArtists
  | ReleaseWithArtistAndSubReleases
  | ReleaseWithArtistAndTracksAndSubreleases;

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
  onCoverDoubleClick?: (release_id: number) => void;
  onLinkClick?: () => void;
  maxCoversCount?: number;
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
  onCoverDoubleClick,
  onLinkClick,
  maxCoversCount = 10,
  testId,
}: ListCardProps) {
  const { t } = useTranslation();
  const { otherReleases, coverRelease } = getCovers(item, maxCoversCount);
  const { settings } = useStore();
  const { darkText, color } = getColorInfo(
    coverRelease,
    settings.USE_RAINBOW_MODE
  );

  function getContent() {
    if (item.entityType === "release") {
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

    if (item.entityType === "artist") {
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

    if (item.entityType === "group") {
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
      className={cx(styles.listCard, {
        [styles.isArtist]: item.entityType === "artist",
        [styles.selected]: selected,
        [styles.hasFocus]: selected && hasFocus,
        [styles.useDarkText]: darkText,
        [styles.hasMultipleCovers]: otherReleases.length,
        className,
      })}
      onClick={onClick}
      onContextMenu={getContextMenu()}
      style={{ background: color || null }}
      data-testid={testId}
    >
      <SlidingCardsView
        className={styles.slidingCards}
        contentClassName={styles.slidingCardsContent}
        coverSize={96}
        coverGap={8}
        contentElement={
          <>
            <div className={styles.content}>{getContent()}</div>
            <ContextMenuButton
              onClick={onContextMenu}
              className={styles.contextMenu}
            />
          </>
        }
      >
        {otherReleases.map((release) => (
          <Cover
            key={release.id}
            {...release}
            className={styles.cover}
            title={`${release.artist.name} - ${getReleaseTitle(release)}`}
            onClick={onCoverClick}
            onDoubleClick={() => onCoverDoubleClick(release.id)}
            onPlaybackClick={() =>
              api.system.playback({ release_id: release.id })
            }
          />
        ))}
        {coverRelease ? (
          <Cover
            key={coverRelease.id}
            {...coverRelease}
            className={styles.cover}
            title={`${coverRelease.artist.name} - ${getReleaseTitle(coverRelease)}`}
            onClick={onCoverClick}
            onDoubleClick={() => onCoverDoubleClick(coverRelease.id)}
            onPlaybackClick={() =>
              api.system.playback({ release_id: coverRelease.id })
            }
          />
        ) : (
          <div className={styles.ghost}></div>
        )}
      </SlidingCardsView>
    </div>
  );
}
