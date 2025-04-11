import { useParams, useSearchParams, Navigate } from "react-router";
import api from "../api";
import type { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";
import { getReleaseContextMenuParams } from "@/lib/utils";
import useCollection from "@/renderer/query/useCollection";
import { useClearSelectionOnLeave } from "@/renderer/hooks/ipc";
import ReleaseList from "@/renderer/components/ReleaseList";
import EditableHeader from "../components/EditableHeader";
import Loading from "@/renderer/components/Loading";
import styles from "./Page.module.css";

export default function CollectionPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const {
        collection,
        isPending,
        error,
        updateTitle,
        deleteReleasesFromCollection,
    } = useCollection(+id);

    useClearSelectionOnLeave();

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

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

    return (
        <div className={styles.page}>
            <EditableHeader
                item={collection}
                onTitleUpdate={updateTitle}
                isFocused={!!searchParams.get("new")}
            />
            <ReleaseList
                releases={collection.releases}
                onDelete={deleteReleasesFromCollection}
                onContextMenu={onContextMenu}
                className={styles.list}
            />
        </div>
    );
}
