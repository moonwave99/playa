import { useNavigate } from "react-router";
import type {
    Release,
    ReleaseWithArtist,
    ReleaseWithArtistAndTracksAndSubreleases,
    ViewMode,
} from "@/types/types";
import type { ScrollToOptions } from "@tanstack/react-virtual";
import { releaseColumnsConfig } from "../hooks/useResponsiveColumns";
import { useKeyManager, withPrevent } from "../hooks/useKeyboardManager";
import useStore from "../store";
import api from "../api";
import { getReleaseLink } from "@/lib/links";
import {
    estimateListCardSize,
    getReleaseWithTracklistHeight,
} from "@/lib/utils";
import ReleaseView from "./ReleaseView";
import ReleaseWithTracklistView from "./ReleaseWithTracklistView";
import List, { type RenderParams, type ListKeyHandler } from "./List";
import ListCard from "./ListCard";
import cx from "clsx";
import styles from "./ReleaseList.module.css";

type ReleaseListProps = {
    releases: ReleaseWithArtistAndTracksAndSubreleases[];
    onDelete?: (releases: ReleaseWithArtist[], event: KeyboardEvent) => void;
    onContextMenu?: (
        selection: ReleaseWithArtistAndTracksAndSubreleases[],
        target_id: number
    ) => void;
    className?: string;
    keyHandlers?: Record<string, ListKeyHandler<ReleaseWithArtist>>;
};

export default function ReleaseList({
    releases,
    onDelete,
    onContextMenu,
    className,
    keyHandlers = {},
}: ReleaseListProps) {
    const navigate = useNavigate();
    const { viewMode, showSidebar, setModalContents } = useStore();
    const { setContext } = useKeyManager();

    function onEnter(
        release: ReleaseWithArtistAndTracksAndSubreleases,
        event: KeyboardEvent
    ) {
        if (event.metaKey) {
            api.system.playback({ release_id: release.id });
            return;
        }
        navigate(getReleaseLink(release));
    }

    function _onContextMenu(selection: number[], index: number) {
        onContextMenu(
            selection.map((index: number) => releases[index]),
            releases[index].id
        );
    }

    function getListConfig(viewMode: ViewMode) {
        if (viewMode === "grid") {
            return {
                columnsConfig: releaseColumnsConfig,
                paddingRight: 16,
                render: ({
                    item,
                    index,
                    selection,
                    ...rest
                }: RenderParams<ReleaseWithArtistAndTracksAndSubreleases>) => (
                    <ReleaseView
                        {...rest}
                        release={item}
                        onContextMenu={() => _onContextMenu(selection, index)}
                    />
                ),
            };
        }
        if (viewMode === "list") {
            return {
                scrollBehavior: { align: "start" } as ScrollToOptions,
                estimateSize: (_: number, index: number) => ({
                    width: "100%",
                    height: getReleaseWithTracklistHeight(releases[index]),
                }),
                render: ({
                    item,
                    index,
                    selection,
                    ...rest
                }: RenderParams<ReleaseWithArtistAndTracksAndSubreleases>) => (
                    <ReleaseWithTracklistView
                        {...rest}
                        release={item}
                        onContextMenu={() => _onContextMenu(selection, index)}
                    />
                ),
            };
        }
        if (viewMode === "compact") {
            return {
                columnsConfig: [
                    { count: 3, width: 900 },
                    { count: 2, width: 600 },
                ],
                estimateSize: estimateListCardSize,
                render: ({
                    item,
                    index,
                    selection,
                    ...rest
                }: RenderParams<ReleaseWithArtistAndTracksAndSubreleases>) => (
                    <ListCard
                        {...rest}
                        item={item}
                        onContextMenu={() => _onContextMenu(selection, index)}
                    />
                ),
            };
        }
    }

    return (
        <List
            shouldPreventSpace
            key={`${viewMode}-${getTotalTracks(releases)}`}
            items={releases}
            className={cx(styles.list, styles[viewMode], className)}
            onEnter={onEnter}
            onBackspace={onDelete}
            onLeft={() => setContext("sidebar")}
            shouldCallOnLeft={() => showSidebar}
            onSelectionChange={(selection) =>
                api.state.selectReleases(
                    selection.map((index) => releases[index])
                )
            }
            {...getListConfig(viewMode)}
            keyHandlers={{
                ...keyHandlers,
                " ": withPrevent(
                    (_event: KeyboardEvent, selection: Release[]) => {
                        setModalContents({
                            name: "lightbox",
                            params: {
                                release: selection[0],
                                context: releases,
                            },
                        });
                    }
                ),
            }}
        />
    );
}

function getTotalTracks(releases: ReleaseWithArtistAndTracksAndSubreleases[]) {
    return releases
        .flatMap((rel) => [rel, ...rel.subReleases])
        .reduce((memo, { tracks }) => memo + tracks.length, 0);
}
