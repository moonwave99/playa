import { useParams, Navigate } from "react-router";
import api from "../api";
import type {
  ReleaseWithArtist,
  ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import { getReleaseContextMenuParams } from "@/lib/utils";
import useCollection from "@/renderer/query/useCollection";
import { useClearSelectionOnLeave } from "@/renderer/hooks/useApi";
import ReleaseList from "@/renderer/components/ReleaseList";
import Loading from "@/renderer/components/Loading";
import ErrorView from "../components/ErrorView";
import styles from "./Page.module.css";
import { withoutShift } from "../hooks/useKeyboardManager";

export default function CollectionPage() {
  const { id } = useParams();
  const {
    collection,
    isPending,
    error,
    removeReleasesFromCollection,
    setCollectionCover,
  } = useCollection(+id);

  useClearSelectionOnLeave();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (!collection) {
    return <Navigate replace to="/collections" />;
  }

  function onContextMenu(
    selection: ReleaseWithArtistAndTracksAndSubreleases[],
    target_id: number
  ) {
    api.menu.release(
      ...getReleaseContextMenuParams({
        selection,
        target_id,
        context: collection,
      })
    );
  }

  const keyHandlers = {
    c: withoutShift(
      (_event: KeyboardEvent, selection: ReleaseWithArtist[]) =>
        selection.length && setCollectionCover(selection[0].id)
    ),
  };

  return (
    <div className={styles.page} data-testid="CollectionPage">
      {!collection?.releases.length ? (
        <div className={styles.placeholder}>
          There are no releases in this collection yet.
        </div>
      ) : (
        <ReleaseList
          context={["collection"]}
          releases={collection.releases}
          onDelete={removeReleasesFromCollection}
          onContextMenu={onContextMenu}
          className={styles.list}
          keyHandlers={keyHandlers}
        />
      )}
    </div>
  );
}
