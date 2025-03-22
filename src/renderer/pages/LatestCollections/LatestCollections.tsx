import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import ReleaseGroup from "@/renderer/components/ReleaseGroup";
import List from "@/renderer/components/List";
import Loading from "@/renderer/components/Loading";
import { getCollectionLink } from "@/lib/links";
import { estimateReleaseGroupSize } from "@/lib/utils";
import { CollectionWithReleases } from "@/types/types";
import styles from "../Page.module.css";

const columnsConfig = [
    { count: 3, width: 700 },
    { count: 2, width: 600 },
];

export default function LatestCollections() {
    const navigate = useNavigate();
    const { setContext } = useKeyManager({});
    const { isPending, error, data } = useQuery({
        queryKey: ["collections", "latest"],
        queryFn: () => window.api.data.getCollections(30),
    });

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Latest Collections</h1>
            <List
                items={data}
                className={styles.list}
                columnsConfig={columnsConfig}
                estimateSize={estimateReleaseGroupSize}
                onEnter={(collection: CollectionWithReleases) =>
                    navigate(getCollectionLink(collection))
                }
                onLeft={() => setContext("sidebar")}
                render={({ item, selected, onClick }) => (
                    <ReleaseGroup
                        link={getCollectionLink(item)}
                        title={item.title}
                        releases={item.releases}
                        selected={selected}
                        onClick={onClick}
                    />
                )}
            />
        </div>
    );
}
