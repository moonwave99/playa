import { Navigate, useParams } from "react-router";
import type { ReleaseWithArtist } from "@/types/types";
import useArtist from "@/renderer/query/useArtist";
import ReleaseList from "@/renderer/components/ReleaseList";
import Loading from "@/renderer/components/Loading";
import styles from "../Page.module.css";

export default function ArtistPage() {
    const { id } = useParams();

    const { isPending, error, artist } = useArtist(+id);

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    if (!artist) {
        return <Navigate replace to="/" />;
    }

    function onContextMenu(selection: ReleaseWithArtist[], target_id: number) {
        const target = artist.releases.find(
            ({ id }: ReleaseWithArtist) => id === target_id
        );
        window.api.menu.release(
            selection.length ? selection : [target],
            target_id,
            artist
        );
    }

    const { name, releases } = artist;

    return (
        <div className={styles.page}>
            <h1
                className={styles.header}
                onContextMenu={() => window.api.menu.artist(artist)}
            >
                {name}
            </h1>
            <ReleaseList releases={releases} onContextMenu={onContextMenu} />
        </div>
    );
}
