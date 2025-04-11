import { Navigate, useParams } from "react-router";
import useRelease from "@/renderer/query/useRelease";
import api from "../api";
import ReleaseWithTracklistView from "@/renderer/components/ReleaseWithTracklistView";
import ErrorView from "../components/ErrorView";
import Loading from "@/renderer/components/Loading";

import styles from "./Page.module.css";

export default function ReleasePage() {
    const { id } = useParams();

    const { isPending, error, release, selectedTrackId } = useRelease(+id);

    if (isPending) {
        return <Loading />;
    }

    if (error) {
        return <ErrorView error={error} />;
    }

    if (!release) {
        return <Navigate replace to="/" />;
    }

    function onContextMenu() {
        api.menu.release([release]);
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
