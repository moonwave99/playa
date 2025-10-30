import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArtistWithReleasesFull } from "@/types/types";
import useStore from "@/renderer/store";
import api from "@/renderer/api";
import {
  getColorInfo,
  getCovers,
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
  const { setModalContents, setUseDarkText } = useStore();
  const { coverRelease } = getCovers(artist);
  const { id, name, releases, appearsIn } = artist;
  const releaseCount = releases.length + appearsIn.length;

  const { darkText, color } = getColorInfo(coverRelease);

  useEffect(() => {
    setUseDarkText(darkText);
    return () => setUseDarkText(false);
  }, [darkText]);

  return (
    <header
      className={cx(styles.view, {
        [styles.useDarkText]: darkText,
      })}
      data-testid="ArtistPageHeader"
      onContextMenu={() => api.menu.artist(artist)}
      style={{ backgroundColor: color || null }}
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
            useDarkText={darkText}
          />
          <ContainingGroupsList
            id={id}
            className={styles.entityList}
            itemClassName={styles.entityListEntry}
            useDarkText={darkText}
          />
        </div>
      </div>
    </header>
  );
}
