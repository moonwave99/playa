import { useTranslation } from "react-i18next";
import { ArtistWithReleasesFull } from "@/types/types";
import useStore from "@/renderer/store";
import useColorInfo from "@/renderer/hooks/useColorInfo";
import useCheckArtistFolderContent from "@/renderer/hooks/useCheckArtistFolderContent";
import api from "@/renderer/api";
import {
  getCovers,
  getReleaseFullTitle,
  normalizeArtistDisplayName,
} from "@/lib/utils";

import Cover from "@/renderer/components/Cover";
import ContainingGroupsList from "@/renderer/components/ContainingGroupsList";
import RelatedArtistsList from "@/renderer/components/RelatedArtistsList";
import { Icon } from "@/renderer/icons";

import cx from "clsx";
import styles from "@/renderer/pageHeader.module.css";
import buttonStyles from "@/renderer/buttons.module.css";

type ArtistPageHeaderProps = {
  artist: ArtistWithReleasesFull;
};

export default function ArtistPageHeader({ artist }: ArtistPageHeaderProps) {
  const { t } = useTranslation();
  const { setModalContents } = useStore();
  const { openRelocateFolderModal, commonMissingPath } =
    useCheckArtistFolderContent(artist);

  const { coverRelease } = getCovers(artist);
  const { id, name, releases, appearsIn } = artist;
  const releaseCount = releases.length + appearsIn.length;

  const { darkText, color } = useColorInfo(coverRelease);

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
            params: { id: coverRelease.id, hideSidebar: true },
          })
        }
        className={styles.cover}
        title={getReleaseFullTitle(coverRelease)}
      />
      <div className={styles.content}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>{normalizeArtistDisplayName(name)}</h1>
          {commonMissingPath && (
            <button
              onClick={openRelocateFolderModal}
              className={cx(
                buttonStyles.button,
                buttonStyles.mini,
                buttonStyles.warning
              )}
              aria-label={t(
                "pages.ArtistPage.actions.openRelocateFolderModal",
                artist
              )}
            >
              <Icon isFor="common.warning" />
            </button>
          )}
        </div>
        <p className={styles.releaseCount}>
          {t("common.count.release", { count: releaseCount })}
        </p>
        <div className={styles.infoWrapper}>
          <RelatedArtistsList
            id={id}
            className={styles.entityList}
            itemClassName={cx(styles.entityListEntry, {
              [styles.useDarkText]: darkText,
            })}
            useDarkText={darkText}
          />
          <ContainingGroupsList
            id={id}
            className={styles.entityList}
            itemClassName={cx(styles.entityListEntry, {
              [styles.useDarkText]: darkText,
            })}
            useDarkText={darkText}
          />
        </div>
      </div>
    </header>
  );
}
