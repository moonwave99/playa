import { useNavigate } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import ReleaseGroup from "@/renderer/components/ReleaseGroup";
import List from "@/renderer/components/List";
import Loading from "@/renderer/components/Loading";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import { estimateReleaseGroupSize } from "@/lib/utils";
import { getArtistLink } from "@/lib/links";
import styles from "../Page.module.css";

const columnsConfig = [
    { count: 3, width: 700 },
    { count: 2, width: 600 },
];

const pageSize = 50;

export default function LatestArtists() {
    const navigate = useNavigate();
    const { setContext } = useKeyManager({});
    const {
        data,
        error,
        isPending,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ["artists", "latest"],
        queryFn: (context) =>
            window.api.data.getLatestArtists({
                take: pageSize,
                skip: context.pageParam,
            }),
        getNextPageParam: (lastGroup) => lastGroup.pagination.skip + pageSize,
        initialPageParam: 0,
    });

    const artists = data ? data.pages.flatMap((page) => page.results) : [];

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
                render={({ item, selected, onClick }) => (
                    <ReleaseGroup
                        link={getArtistLink(item)}
                        title={item.name}
                        releases={item.releases}
                        selected={selected}
                        onClick={onClick}
                    />
                )}
            />
        </div>
    );
}
