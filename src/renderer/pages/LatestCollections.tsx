import { useNavigate } from "react-router";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import { compactColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import api from "../api";
import useStore from "@/renderer/store";
import { getCollectionLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import useCollections from "@/renderer/query/useCollections";
import { CollectionWithReleases } from "@/types/types";
import Loading from "@/renderer/components/Loading";
import ErrorView from "../components/ErrorView";
import List from "@/renderer/components/List";
import ListCard from "@/renderer/components/ListCard";

import styles from "./Page.module.css";

export default function LatestCollections() {
    const navigate = useNavigate();
    const { showSidebar } = useStore();
    const { setContext } = useKeyManager();
    const { isPending, error, collections, deleteCollections } =
        useCollections();

    if (isPending) {
        return <Loading />;
    }

    if (error) {
        return <ErrorView error={error} />;
    }

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
            {!collections?.length ? (
                <div className={styles.placeholder}>
                    There are no collections yet.
                </div>
            ) : (
                <List
                    shouldPreventSpace
                    disableMultipleSelection
                    items={collections}
                    className={styles.list}
                    columnsConfig={compactColumnsConfig}
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
            )}
        </div>
    );
}
