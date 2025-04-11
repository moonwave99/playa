import { useNavigate } from "react-router";
import type {
    HasId,
    Release,
    ReleaseWithArtistAndSubreleases,
    ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import api from "../api";
import { releaseColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import {
    useKeyManager,
    withPrevent,
} from "@/renderer/hooks/useKeyboardManager";
import useLatestReleases from "@/renderer/query/useLatestReleases";
import { useClearSelectionOnLeave } from "@/renderer/hooks/ipc";
import useStore from "@/renderer/store";
import { getReleaseLink } from "@/lib/links";
import { getReleaseContextMenuParams } from "@/lib/utils";
import Loading from "@/renderer/components/Loading";
import List from "@/renderer/components/List";
import ReleaseView from "@/renderer/components/ReleaseView";

import styles from "./Page.module.css";

export default function LatestReleases() {
    const navigate = useNavigate();
    const { showSidebar, setModalContents } = useStore();
    const { setContext } = useKeyManager();
    const {
        releases,
        error,
        isPending,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useLatestReleases();

    useClearSelectionOnLeave();

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    function onEnter(
        release: ReleaseWithArtistAndSubreleases,
        event: KeyboardEvent
    ) {
        if (event.metaKey) {
            api.system.playback({ release_id: release.id });
            return;
        }
        navigate(getReleaseLink(release));
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Latest Releases</h1>
            {!releases?.length ? (
                <div className={styles.placeholder}>
                    There are no releases yet.
                </div>
            ) : (
                <List
                    shouldPreventSpace
                    items={releases}
                    className={styles.list}
                    columnsConfig={releaseColumnsConfig}
                    isInfinite
                    fetchNextPage={fetchNextPage}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onEnter={onEnter}
                    onLeft={() => setContext("sidebar")}
                    shouldCallOnLeft={() => showSidebar}
                    onSelectionChange={(selection) =>
                        api.state.selectReleases(
                            selection.map((index) => releases[index])
                        )
                    }
                    keyHandlers={{
                        " ": withPrevent(
                            (_event: KeyboardEvent, selection: Release[]) => {
                                setModalContents({
                                    name: "lightbox",
                                    params: { release: selection[0] },
                                });
                            }
                        ),
                    }}
                    render={({ item, selection, ...rest }) => (
                        <ReleaseView
                            {...rest}
                            release={
                                item as ReleaseWithArtistAndTracksAndSubreleases
                            }
                            onContextMenu={() =>
                                api.menu.release(
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
            )}
        </div>
    );
}
