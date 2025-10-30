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
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash";

type EntityCardProps = {
  item: ArtistWithReleases | ReleaseWithArtist;
  onRemoveEntityClick?: () => void;
};

export default function ReleaseCard({
  item,
  onRemoveEntityClick,
}: EntityCardProps) {
  const { t } = useTranslation();
  const { entityType, id } = item;
  const coverRelease =
    entityType === "artist" ? item.coverRelease || item.releases.at(0) : item;

  const title =
    entityType === "artist" ? (
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
          aria-label={t("components.EntityCard.remove", {
            entity: capitalize(entityType),
          })}
        >
          <MdRemoveCircle />
        </button>
      )}
      <Cover className={styles.cover} {...coverRelease} />
      <span className={styles.title} title={`[${id}]`}>
        {title}
      </span>
    </article>
  );
}
