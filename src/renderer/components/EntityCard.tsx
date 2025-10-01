import {
  ArtistWithReleases,
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
} from "@/types/types";
import Cover from "./Cover";
import { getReleaseTitle } from "@/lib/utils";
import styles from "./EntityCard.module.css";
import buttonStyles from "../buttons.module.css";
import { MdRemoveCircle } from "react-icons/md";

type EntityCardProps = {
  item: ArtistWithReleases | ReleaseWithArtist;
  onRemoveEntityClick?: () => void;
};

export default function ReleaseCard({
  item,
  onRemoveEntityClick,
}: EntityCardProps) {
  const coverRelease =
    item.entityType === "Artist"
      ? item.coverRelease || item.releases.at(0)
      : item;

  const title =
    item.entityType === "Artist" ? (
      item.name
    ) : (
      <>
        {item.artist.name}
        <br />
        {getReleaseTitle(item as ReleaseWithArtistAndSubReleases)}
      </>
    );

  return (
    <article className={styles.view}>
      {onRemoveEntityClick && (
        <button
          type="button"
          className={buttonStyles.CornerActionButton}
          onClick={onRemoveEntityClick}
          aria-label={`Remove ${item.entityType}`}
        >
          <MdRemoveCircle />
        </button>
      )}
      <Cover className={styles.cover} {...coverRelease} />
      <span className={styles.title} title={`[${item.id}]`}>
        {title}
      </span>
    </article>
  );
}
