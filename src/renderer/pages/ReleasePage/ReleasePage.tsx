import { Navigate, useParams } from "react-router";
import useRelease from "@/renderer/query/useRelease";
import ReleaseWithTracklistView from "@/renderer/components/ReleaseWithTracklistView";
import Loading from "@/renderer/components/Loading";
import styles from "../Page.module.css";

export default function ReleasePage() {
    const { id } = useParams();

    const { isPending, error, release, selectedTrackId } = useRelease(+id);

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    if (!release) {
        return <Navigate replace to="/" />;
    }

    function onContextMenu() {
        window.api.menu.release([release], release.id);
    }

    return (
        <div className={styles.page} onContextMenu={onContextMenu}>
            <ReleaseWithTracklistView
                isSingle
                release={release}
                selectedTrackId={selectedTrackId}
            />
        </div>
    );
}
