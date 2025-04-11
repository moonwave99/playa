import { Navigate, useParams } from "react-router";
import type { ReleaseWithArtist } from "@/types/types";
import useArtist from "@/renderer/query/useArtist";
import api from "@/renderer/api";
import { useClearSelectionOnLeave } from "@/renderer/hooks/ipc";
import { getReleaseContextMenuParams } from "@/lib/utils";
import useStore from "@/renderer/store";
import ReleaseList from "@/renderer/components/ReleaseList";
import ListCard from "@/renderer/components/ListCard";
import Loading from "@/renderer/components/Loading";
import styles from "./Page.module.css";

export default function ArtistPage() {
    const { id } = useParams();
    const { setUseDarkText } = useStore();

    const { isPending, error, artist, deleteReleases } = useArtist(+id);

    useClearSelectionOnLeave();

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

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

    return (
        <div
            className={styles.page}
            onContextMenu={() => api.menu.artist(artist)}
        >
            <ListCard isSingle item={artist} onColorChange={setUseDarkText} />
            <ReleaseList
                releases={artist.releases}
                onContextMenu={onContextMenu}
                onDelete={onDelete}
                className={styles.hasHeaderWithCover}
            />
        </div>
    );
}
