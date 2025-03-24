import { useNavigate } from "react-router";
import ReleaseGroup from "@/renderer/components/ReleaseGroup";
import List from "@/renderer/components/List";
import Loading from "@/renderer/components/Loading";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import useLatestArtists from "@/renderer/query/useLatestArtists";
import { estimateReleaseGroupSize } from "@/lib/utils";
import { getArtistLink } from "@/lib/links";
import styles from "../Page.module.css";

const columnsConfig = [
    { count: 3, width: 700 },
    { count: 2, width: 600 },
];

export default function LatestArtists() {
    const navigate = useNavigate();
    const { setContext } = useKeyManager({});
    const {
        artists,
        error,
        isPending,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useLatestArtists();

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Latest Artists</h1>
            <List
                items={artists}
                className={styles.list}
                columnsConfig={columnsConfig}
                estimateSize={estimateReleaseGroupSize}
                isInfinite
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onEnter={(artist) => navigate(getArtistLink(artist))}
                onLeft={() => setContext("sidebar")}
                render={({ item, ...rest }) => (
                    <ReleaseGroup
                        link={getArtistLink(item)}
                        title={item.name}
                        releases={item.releases}
                        {...rest}
                    />
                )}
            />
        </div>
    );
}
