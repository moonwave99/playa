import { useNavigate } from "react-router";
import type {
    HasId,
    ReleaseWithArtistAndSubreleases,
    ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import ReleaseView from "@/renderer/components/ReleaseView";
import { releaseColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import useLatestReleases from "@/renderer/query/useLatestReleases";
import { getReleaseLink } from "@/lib/links";
import { getReleaseContextMenuParams } from "@/lib/utils";
import List from "@/renderer/components/List";
import Loading from "@/renderer/components/Loading";
import styles from "../Page.module.css";

export default function LatestReleases() {
    const navigate = useNavigate();
    const { setContext } = useKeyManager({});
    const {
        releases,
        error,
        isPending,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useLatestReleases();

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
                onSelectionChange={(selection) =>
                    window.api.state.select(
                        selection.map((index) => releases[index])
                    )
                }
                render={({ item, selection, ...rest }) => (
                    <ReleaseView
                        {...rest}
                        release={
                            item as ReleaseWithArtistAndTracksAndSubreleases
                        }
                        onContextMenu={() =>
                            window.api.menu.release(
                                ...getReleaseContextMenuParams({
                                    selection: selection.map(
                                        (index) => releases[index]
                                    ),
                                    target_id: (item as HasId).id,
                                    context: { releases },
                                })
                            )
                        }
                    />
                )}
            />
        </div>
    );
}
