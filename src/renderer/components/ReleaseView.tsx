import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import type { ReleaseWithArtistAndSubReleases } from "@/types/types";
import { getReleaseTitle, getDiscInfo, withStopPropagation } from "@/lib/utils";
import { getReleaseLink } from "@/lib/links";
import api from "../api";
import cx from "clsx";
import Cover from "./Cover";
import Link from "./Link";
import EntityList from "./EntityList";
import styles from "./ReleaseView.module.css";

type ReleaseViewProps = {
  release: ReleaseWithArtistAndSubReleases;
  onClick: (event: MouseEvent) => void;
  onContextMenu?: () => void;
  className?: string;
  selected?: boolean;
  hasFocus?: boolean;
};

export default function ReleaseView({
  release,
  selected,
  className,
  hasFocus,
  onClick,
  onContextMenu,
}: ReleaseViewProps) {
  const { t } = useTranslation();
  const { artist, year, type, id, additionalArtists } = release;
  const releaseTitle = getReleaseTitle(release);
  return (
    <article
      data-selected={selected}
      data-hasfocus={selected && hasFocus}
      className={cx(styles.releaseView, className, {
        [styles.selected]: selected,
        [styles.hasFocus]: selected && hasFocus,
      })}
      onClick={onClick}
      onContextMenu={withStopPropagation(onContextMenu)}
    >
      <p className={styles.info}>
        <span>
          {type} {getDiscInfo(release)}
        </span>
        <span>{year}</span>
      </p>
      <Cover
        {...release}
        className={styles.coverWrapper}
        title={`${artist.name} - ${releaseTitle}`}
        onDoubleClick={() => api.system.playback({ release_id: id })}
      />
      <div className={styles.footer}>
        <EntityList
          context={release}
          i18nkey="entityList.actions.delete.additionalArtists"
          textOnly
          className={styles.artists}
          canDeleteFirstEntry={false}
          items={[artist, ...additionalArtists]}
        />
        <Link
          className={styles.title}
          to={getReleaseLink(release)}
          title={t("components.ReleaseView.link", { title: releaseTitle })}
        >
          {releaseTitle}
        </Link>
      </div>
    </article>
  );
}
