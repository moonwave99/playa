import { useNavigate } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ReleaseWithArtistAndSubreleases } from "@/types/types";
import ReleaseView from "@/renderer/components/ReleaseView";
import { releaseColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import { getReleaseLink } from "@/lib/links";
import List from "@/renderer/components/List";
import Loading from "@/renderer/components/Loading";
import styles from "../Page.module.css";

const pageSize = 50;

export default function LatestReleases() {
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
        queryKey: ["releases", "latest"],
        queryFn: (context) =>
            window.api.data.getLatestReleases({
                take: pageSize,
                skip: context.pageParam,
            }),
        getNextPageParam: (lastGroup) => lastGroup.pagination.skip + pageSize,
        initialPageParam: 0,
    });

    const releases = data ? data.pages.flatMap((page) => page.results) : [];

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    function playback(release_id: number) {
        window.api.system.playback({ release_id });
    }

    function onEnter(
        release: ReleaseWithArtistAndSubreleases,
        event: KeyboardEvent
    ) {
        if (event.metaKey) {
            playback(release.id);
            return;
        }
        navigate(getReleaseLink(release));
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Latest Releases</h1>
            <List
                items={releases}
                className={styles.list}
                columnsConfig={releaseColumnsConfig}
                isInfinite
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onEnter={onEnter}
                onLeft={() => setContext("sidebar")}
                render={({ item, index, selection, ...rest }) => (
                    <ReleaseView
                        {...rest}
                        release={item}
                        onDoubleClick={() => playback(item.id)}
                        onContextMenu={() =>
                            window.api.menu.release(
                                selection.length
                                    ? selection.map((index) => releases[index])
                                    : [item],
                                releases[index].id
                            )
                        }
                    />
                )}
            />
        </div>
    );
}
