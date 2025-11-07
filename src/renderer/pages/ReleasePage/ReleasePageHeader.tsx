import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ReleaseWithArtistAndTracksAndSubreleasesAndCollections } from "@/types/types";
import {
  getColorInfo,
  getReleaseFullTitle,
  getReleaseTitle,
} from "@/lib/utils";
import useStore from "@/renderer/store";
import usePathExists from "@/renderer/hooks/usePathExists";
import api from "@/renderer/api";

import Cover from "@/renderer/components/Cover";
import EntityList from "@/renderer/components/EntityList";
import ReleaseInfo from "@/renderer/components/ReleaseInfo";
import ContainingCollectionsList from "@/renderer/components/ContainingCollectionsList";
import { Icon } from "@/renderer/icons";

import cx from "clsx";
import styles from "@/renderer/pageHeader.module.css";
import buttonStyles from "@/renderer/buttons.module.css";

type ReleasePageHeaderProps = {
  release: ReleaseWithArtistAndTracksAndSubreleasesAndCollections;
  selectedTrackId?: number;
};

export default function ReleasePageHeader({ release }: ReleasePageHeaderProps) {
  const { t } = useTranslation();
  const { setModalContents, setUseDarkText } = useStore();
  const { darkText, color } = getColorInfo(release);
  const { exists, onMissingPathClick } = usePathExists(release);

  useEffect(() => {
    setUseDarkText(darkText);
    return () => setUseDarkText(false);
  }, [darkText]);

  return (
    <header
      className={cx(styles.view, {
        [styles.useDarkText]: darkText,
      })}
      data-testid="ReleasePageHeader"
      onContextMenu={() => api.menu.release([release])}
      style={{ backgroundColor: color || null }}
    >
      <Cover
        {...release}
        onClick={() =>
          setModalContents({
            name: "lightbox",
            params: { id: release.id, hideSidebar: true },
          })
        }
        className={styles.cover}
        title={getReleaseFullTitle(release)}
        onPlaybackClick={() => api.system.playback({ release_id: release.id })}
      />
      <div className={styles.content}>
        <EntityList
          linkClassName={styles.artist}
          textOnly
          context={release}
          canDeleteFirstEntry={false}
          items={[release.artist, ...release.additionalArtists]}
          onDelete={(artist_id) =>
            api.release.removeAdditionalArtist({
              release_id: release.id,
              artist_id,
            })
          }
        />

        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>{getReleaseTitle(release)}</h1>
          {typeof exists === "boolean" && !exists && (
            <button
              onClick={onMissingPathClick}
              className={cx(
                buttonStyles.button,
                buttonStyles.mini,
                buttonStyles.warning
              )}
              aria-label={t(
                "pages.ReleasePage.actions.openMissingFolderDialog",
                release
              )}
            >
              <Icon isFor="common.warning" />
            </button>
          )}
        </div>
        <div className={styles.infoWrapper}>
          <ReleaseInfo release={release} isSingle useDarkText={darkText} />
          <ContainingCollectionsList
            useDarkText={darkText}
            id={release.id}
            className={styles.entityList}
            itemClassName={cx(styles.entityListEntry, {
              [styles.useDarkText]: darkText,
            })}
          />
        </div>
      </div>
    </header>
  );
}
