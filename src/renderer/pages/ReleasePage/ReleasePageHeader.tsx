import { ReleaseWithArtistAndTracksAndSubreleasesAndCollections } from "@/types/types";
import { getReleaseFullTitle, getReleaseTitle } from "@/lib/utils";
import useStore from "@/renderer/store";
import api from "@/renderer/api";

import Cover from "@/renderer/components/Cover";
import EntityList from "@/renderer/components/EntityList";
import ReleaseInfo from "@/renderer/components/ReleaseInfo";
import ContainingCollectionsList from "@/renderer/components/ContainingCollectionsList";

import cx from "clsx";
import styles from "@/renderer/pageHeader.module.css";

type ReleasePageHeaderProps = {
  release: ReleaseWithArtistAndTracksAndSubreleasesAndCollections;
  selectedTrackId?: number;
};

export default function ReleasePageHeader({ release }: ReleasePageHeaderProps) {
  const { setModalContents } = useStore();
  return (
    <header
      className={cx(styles.view)}
      data-testid="ReleasePageHeader"
      onContextMenu={() => api.menu.release([release])}
    >
      <Cover
        {...release}
        onClick={() =>
          setModalContents({
            name: "lightbox",
            params: { release, hideSidebar: true },
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
        <h1 className={styles.title}>{getReleaseTitle(release)}</h1>
        <div className={styles.infoWrapper}>
          <ReleaseInfo release={release} isSingle />
          <ContainingCollectionsList
            id={release.id}
            className={styles.entityList}
            itemClassName={styles.entityListEntry}
          />
        </div>
      </div>
    </header>
  );
}
