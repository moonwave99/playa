import { useTranslation } from "react-i18next";
import { capitalize } from "lodash";
import {
  ArtistWithReleases,
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
} from "@/types/types";
import { getReleaseTitle } from "@/lib/utils";
import Cover from "./Cover";

import { TiDelete } from "react-icons/ti";
import styles from "./EntityCard.module.css";
import buttonStyles from "../buttons.module.css";

type EntityCardProps = {
  item: ArtistWithReleases | ReleaseWithArtist;
  onRemoveEntityClick?: () => void;
  removeButtonLabel?: string;
};

export default function EntityCard({
  item,
  onRemoveEntityClick,
  removeButtonLabel,
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
          aria-label={
            removeButtonLabel ||
            t("components.EntityCard.actions.remove", {
              entity: capitalize(entityType),
            })
          }
        >
          <TiDelete />
        </button>
      )}
      <Cover className={styles.cover} {...coverRelease} />
      <span className={styles.title} title={`[${id}]`}>
        {title}
      </span>
    </article>
  );
}
