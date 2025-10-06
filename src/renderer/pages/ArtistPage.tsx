import { Navigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { ReleaseWithArtist } from "@/types/types";
import useArtist from "@/renderer/query/useArtist";
import api from "@/renderer/api";
import { withoutShift } from "@/renderer/hooks/useKeyboardManager";
import { useClearSelectionOnLeave } from "@/renderer/hooks/useApi";
import { getReleaseContextMenuParams } from "@/lib/utils";
import useStore from "@/renderer/store";
import ReleaseList from "@/renderer/components/ReleaseList";
import ListCard from "@/renderer/components/ListCard";
import Loading from "@/renderer/components/Loading";
import ErrorView from "@/renderer/components/ErrorView";

import styles from "./Page.module.css";

export default function ArtistPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { setUseDarkText } = useStore();

  const { isPending, error, artist, deleteReleases, setArtistCover } =
    useArtist(+id);

  useClearSelectionOnLeave();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (!artist) {
    return <Navigate replace to="/" />;
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

  function onDelete(selection: ReleaseWithArtist[], event: KeyboardEvent) {
    if (!event.metaKey) {
      return;
    }
    deleteReleases(selection.map(({ id }) => id));
  }

  const keyHandlers = {
    c: withoutShift(
      (_event: KeyboardEvent, selection: ReleaseWithArtist[]) =>
        selection.length && setArtistCover(selection[0].id)
    ),
  };

  return (
    <div
      className={styles.page}
      onContextMenu={() => api.menu.artist(artist)}
      data-testid="ArtistPage"
    >
      <ListCard isSingle item={artist} onColorChange={setUseDarkText} />
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
          onDelete={onDelete}
          className={styles.hasHeaderWithCover}
          keyHandlers={keyHandlers}
          context={["artists", id]}
        />
      )}
    </div>
  );
}
