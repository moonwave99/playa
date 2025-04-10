import { useNavigate } from "react-router";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import api from "../../api";
import useStore from "@/renderer/store";
import { getCollectionLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import useCollections from "@/renderer/query/useCollections";
import { CollectionWithReleases } from "@/types/types";
import Loading from "@/renderer/components/Loading";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";

import styles from "../Page.module.css";

const columnsConfig = [
    { count: 3, width: 900 },
    { count: 2, width: 600 },
];

export default function LatestCollections() {
    const navigate = useNavigate();
    const { showSidebar } = useStore();
    const { setContext } = useKeyManager();
    const { isPending, error, collections, deleteCollections } =
        useCollections();

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    function onDelete(
        selection: CollectionWithReleases[],
        event: KeyboardEvent
    ) {
        if (!event.metaKey) {
            return;
        }
        deleteCollections(selection.map(({ id }) => id));
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Latest Collections</h1>
            <List
                shouldPreventSpace
                disableMultipleSelection
                items={collections}
                className={styles.list}
                columnsConfig={columnsConfig}
                estimateSize={estimateListCardSize}
                onEnter={(collection: CollectionWithReleases) =>
                    navigate(getCollectionLink(collection))
                }
                onBackspace={onDelete}
                onLeft={() => setContext("sidebar")}
                shouldCallOnLeft={() => showSidebar}
                render={({ item, ...rest }) => (
                    <ListCard
                        showMultipleCovers
                        item={item}
                        onContextMenu={() => api.menu.collection(item)}
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
