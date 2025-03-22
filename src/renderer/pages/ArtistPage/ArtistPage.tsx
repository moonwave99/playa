import { Navigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReleaseWithArtist } from "@/types/types";
import ReleaseList from "@/renderer/components/ReleaseList";
import Loading from "@/renderer/components/Loading";
import styles from "../Page.module.css";

export default function ArtistPage() {
    const { id } = useParams();

    const { isPending, error, data } = useQuery({
        queryKey: ["artists", +id],
        queryFn: () => window.api.data.getArtist(+id),
    });

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    if (!data) {
        return <Navigate replace to="/" />;
    }

    function onContextMenu(selection: ReleaseWithArtist[], target_id: number) {
        const target = data.releases.find(
            ({ id }: ReleaseWithArtist) => id === target_id
        );
        window.api.menu.release(
            selection.length ? selection : [target],
            target_id,
            data
        );
    }

    const { name, releases } = data;

    return (
        <div className={styles.page}>
            <h1
                className={styles.header}
                onContextMenu={() => window.api.menu.artist(data)}
            >
                {name}
            </h1>
            <ReleaseList releases={releases} onContextMenu={onContextMenu} />
        </div>
    );
}
