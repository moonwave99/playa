import { Navigate, useParams } from "react-router";
import type { ReleaseWithArtist } from "@/types/types";
import useArtist from "@/renderer/query/useArtist";
import { useClearSelectionOnLeave } from "@/renderer/hooks/ipc";
import { getReleaseContextMenuParams } from "@/lib/utils";
import ReleaseList from "@/renderer/components/ReleaseList";
import Loading from "@/renderer/components/Loading";
import styles from "../Page.module.css";

export default function ArtistPage() {
    const { id } = useParams();

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
        window.api.menu.release(
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

    const { name, releases } = artist;

    return (
        <div
            className={styles.page}
            onContextMenu={() => window.api.menu.artist(artist)}
        >
            <h1 className={styles.header}>{name}</h1>
            <ReleaseList
                releases={releases}
                onContextMenu={onContextMenu}
                onDelete={onDelete}
            />
        </div>
    );
}
