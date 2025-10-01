import {
  ArtistWithReleases,
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
} from "@/types/types";
import styles from "./EntityCard.module.css";
import Cover from "./Cover";
import { getReleaseTitle } from "@/lib/utils";

type EntityCardProps = {
  item: ArtistWithReleases | ReleaseWithArtist;
};

export default function ReleaseCard({ item }: EntityCardProps) {
  const coverRelease = item.entityType === "Artist" ? item.coverRelease : item;
  const title =
    item.entityType === "Artist"
      ? item.name
      : getReleaseTitle(item as ReleaseWithArtistAndSubReleases);
  return (
    <article className={styles.view}>
      <Cover className={styles.cover} {...coverRelease} />
      <span className={styles.title} title={`[${item.id}]`}>
        {title}
      </span>
    </article>
  );
}
