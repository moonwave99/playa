import { useNavigate } from "react-router";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import ListCard from "@/renderer/components/ListCard";
import List from "@/renderer/components/List";
import Loading from "@/renderer/components/Loading";
import { getCollectionLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import useCollections from "@/renderer/query/useCollections";
import { CollectionWithReleases } from "@/types/types";
import styles from "../Page.module.css";

const columnsConfig = [
    { count: 3, width: 900 },
    { count: 2, width: 600 },
];

export default function LatestCollections() {
    const navigate = useNavigate();
    const { setContext } = useKeyManager({});
    const { isPending, error, collections } = useCollections();

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Latest Collections</h1>
            <List
                items={collections}
                className={styles.list}
                columnsConfig={columnsConfig}
                estimateSize={estimateListCardSize}
                onEnter={(collection: CollectionWithReleases) =>
                    navigate(getCollectionLink(collection))
                }
                onLeft={() => setContext("sidebar")}
                render={({ item, ...rest }) => (
                    <ListCard item={item} {...rest} />
                )}
            />
        </div>
    );
}
