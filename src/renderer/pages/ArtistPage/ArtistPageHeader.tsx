import { ArtistWithReleasesFull } from "@/types/types";
import { useTranslation } from "react-i18next";
import useStore from "@/renderer/store";
import api from "@/renderer/api";
import {
  getCoverRelease,
  getReleaseFullTitle,
  normalizeArtistDisplayName,
} from "@/lib/utils";

import Cover from "@/renderer/components/Cover";
import ContainingGroupsList from "@/renderer/components/ContainingGroupsList";
import RelatedArtistsList from "@/renderer/components/RelatedArtistsList";

import cx from "clsx";
import styles from "@/renderer/pageHeader.module.css";

type ArtistPageHeaderProps = {
  artist: ArtistWithReleasesFull;
};

export default function ArtistPageHeader({ artist }: ArtistPageHeaderProps) {
  const { t } = useTranslation();
  const { setModalContents } = useStore();
  const coverRelease = getCoverRelease(artist);
  const { id, name, releases, appearsIn } = artist;
  const releaseCount = releases.length + appearsIn.length;

  return (
    <header
      className={cx(styles.view)}
      data-testid="ArtistPageHeader"
      onContextMenu={() => api.menu.artist(artist)}
    >
      <Cover
        {...coverRelease}
        onClick={() =>
          setModalContents({
            name: "lightbox",
            params: { release: coverRelease, hideSidebar: true },
          })
        }
        className={styles.cover}
        title={getReleaseFullTitle(coverRelease)}
      />
      <div className={styles.content}>
        <h1 className={styles.title}>{normalizeArtistDisplayName(name)}</h1>
        <p className={styles.releaseCount}>
          {t("common.count.release", { count: releaseCount })}
        </p>
        <div className={styles.infoWrapper}>
          <RelatedArtistsList
            id={id}
            className={styles.entityList}
            itemClassName={styles.entityListEntry}
          />
          <ContainingGroupsList
            id={id}
            className={styles.entityList}
            itemClassName={styles.entityListEntry}
          />
        </div>
      </div>
    </header>
  );
}
