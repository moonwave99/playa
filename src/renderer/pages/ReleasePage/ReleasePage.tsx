import { useEffect } from "react";
import type { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";
import { Navigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import ReleaseWithTracklistView from "@/renderer/components/ReleaseWithTracklistView";
import Loading from "@/renderer/components/Loading";
import styles from "../Page.module.css";

function hasTracks(release: ReleaseWithArtistAndTracksAndSubreleases) {
    return [
        release.tracks,
        ...release.subReleases.map(
            (x: ReleaseWithArtistAndTracksAndSubreleases) => x.tracks
        ),
    ].every((x) => x.length);
}

export default function ReleasePage() {
    const { id } = useParams();

    const { isPending, error, data, refetch } = useQuery({
        queryKey: ["releases", +id],
        queryFn: () => window.api.data.getRelease(+id),
    });

    useEffect(() => {
        if (!data || hasTracks(data)) {
            return;
        }
        window.api.system.refreshReleaseContents(data.id).then(refetch);
    }, [data]);

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    if (!data) {
        return <Navigate replace to="/" />;
    }

    function onContextMenu() {
        window.api.menu.release([data], data.id);
    }

    return (
        <div className={styles.page}>
            <ReleaseWithTracklistView
                release={data}
                onContextMenu={onContextMenu}
            />
        </div>
    );
}
