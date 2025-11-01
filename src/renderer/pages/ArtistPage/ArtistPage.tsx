import { Navigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { ReleaseWithArtist } from "@/types/types";
import useArtist from "@/renderer/query/useArtist";
import api from "@/renderer/api";
import { useSelect } from "@/renderer/hooks/useSelect";
import useTitle from "@/renderer/hooks/useTitle";
import { getReleaseContextMenuParams } from "@/lib/utils";

import ArtistPageHeader from "./ArtistPageHeader";
import ReleaseList from "@/renderer/components/ReleaseList";
import Loading from "@/renderer/components/Loading";
import ErrorView from "@/renderer/components/ErrorView";

import cx from "clsx";
import styles from "../Page.module.css";

export default function ArtistPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { isPending, error, artist } = useArtist(+id);

  const { select } = useSelect("release");
  useSelect("artist", [+id]);
  useTitle(artist && t(`nav.titles.artist`, artist));

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (!artist) {
    return <Navigate replace to="/" state={{ isRedirect: true }} />;
  }

  function onContextMenu(selection: ReleaseWithArtist[], target_id: number) {
    api.menu.release(
      ...getReleaseContextMenuParams({
        selection,
        target_id,
        context: artist,
      })
    );
  }

  return (
    <div
      className={cx(styles.page, styles.singlePage)}
      onContextMenu={() => api.menu.artist(artist)}
      data-testid="ArtistPage"
    >
      <ArtistPageHeader artist={artist} />
      {!artist?.releases.length ? (
        <div className={styles.placeholder}>
          {t("placeholders.emptyListForContainer", {
            entity: "Releases",
            container: "Artist",
          })}
        </div>
      ) : (
        <ReleaseList
          releases={artist.releases}
          onContextMenu={onContextMenu}
          onSelect={select}
          className={styles.hasHeaderWithCover}
          context={["artists", id]}
        />
      )}
    </div>
  );
}
