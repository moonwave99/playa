import { getReleaseTitle, getCoverRelease } from "@/lib/utils";
import {
  CollectionWithReleases,
  ArtistWithReleasesAndAppearances,
  GroupWithArtists,
  ReleaseWithArtistAndSubReleases,
} from "@/types/types";

import Cover from "./Cover";

import cx from "clsx";
import styles from "./MultipleCovers.module.css";

export type MultipleCoversProps = {
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

export default function MultipleCovers({
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
