import { useNavigate } from "react-router";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import useLatestArtists from "@/renderer/query/useLatestArtists";
import api from "../../api";
import useStore from "@/renderer/store";
import { getArtistLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import Loading from "@/renderer/components/Loading";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";

import styles from "../Page.module.css";

const columnsConfig = [
    { count: 3, width: 900 },
    { count: 2, width: 600 },
];

export default function LatestArtists() {
    const navigate = useNavigate();
    const { showSidebar } = useStore();
    const { setContext } = useKeyManager();
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
                disableMultipleSelection
                items={artists}
                className={styles.list}
                estimateSize={estimateListCardSize}
                isInfinite
                columnsConfig={columnsConfig}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onEnter={(artist) => navigate(getArtistLink(artist))}
                onLeft={() => setContext("sidebar")}
                shouldCallOnLeft={() => showSidebar}
                render={({ item, ...rest }) => (
                    <ListCard
                        showMultipleCovers
                        item={item}
                        onContextMenu={() => api.menu.artist(item)}
                        onCoverDoubleClick={(release_id) =>
                            api.system.playback({ release_id })
                        }
                        {...rest}
                    />
                )}
            />
        </div>
    );
}
