import { useNavigate } from "react-router";
import type {
    ReleaseWithArtist,
    ReleaseWithArtistAndTracksAndSubreleases,
} from "@/types/types";
import { releaseColumnsConfig } from "@/renderer/hooks/useResponsiveColumns";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import { getArtistLink, getReleaseLink } from "@/lib/links";
import { getReleaseWithTracklistHeight } from "@/lib/utils";
import ReleaseView from "@/renderer/components/ReleaseView";
import ReleaseWithTracklistView from "@/renderer/components/ReleaseWithTracklistView";
import List, {
    withCurrentSelection,
    withCurrentSelectionId,
} from "@/renderer/components/List";
import useStore from "../store";
import cx from "clsx";
import styles from "./ReleaseList.module.css";

type ReleaseListProps = {
    releases: ReleaseWithArtistAndTracksAndSubreleases[];
    onDelete?: (releases: ReleaseWithArtist[], event: KeyboardEvent) => void;
    onContextMenu?: (
        selection: ReleaseWithArtistAndTracksAndSubreleases[],
        target_id: number
    ) => void;
};

export default function ReleaseList({
    releases,
    onDelete,
    onContextMenu,
}: ReleaseListProps) {
    const navigate = useNavigate();
    const { viewMode } = useStore();
    const { setContext } = useKeyManager({});

    function onEnter(
        release: ReleaseWithArtistAndTracksAndSubreleases,
        event: KeyboardEvent
    ) {
        if (event.metaKey) {
            window.api.system.playback({ release_id: release.id });
            return;
        }
        navigate(getReleaseLink(release));
    }

    function onLeft() {
        setContext("sidebar");
    }

    return (
        <List
            key={`${viewMode}-${getTotalTracks(releases)}`}
            items={releases}
            className={cx(styles.list, styles[viewMode])}
            columnsConfig={
                viewMode === "grid" ? releaseColumnsConfig : undefined
            }
            onEnter={onEnter}
            onBackspace={onDelete}
            estimateSize={
                viewMode === "grid"
                    ? undefined
                    : (_, index) => ({
                          width: "100%",
                          height: getReleaseWithTracklistHeight(
                              releases[index]
                          ),
                      })
            }
            onLeft={onLeft}
            paddingRight={viewMode === "grid" ? 16 : 0}
            keyHandlers={getDefaultKeyHandlers(navigate)}
            render={({ item, index, selected, hasFocus, selection, onClick }) =>
                viewMode === "grid" ? (
                    <ReleaseView
                        release={
                            item as ReleaseWithArtistAndTracksAndSubreleases
                        }
                        selected={selected}
                        hasFocus={hasFocus}
                        onClick={onClick}
                        onContextMenu={() =>
                            onContextMenu(
                                selection.map((index) => releases[index]),
                                releases[index].id
                            )
                        }
                    />
                ) : (
                    <ReleaseWithTracklistView
                        inList
                        release={
                            item as ReleaseWithArtistAndTracksAndSubreleases
                        }
                        selected={selected}
                        hasFocus={hasFocus}
                        onClick={onClick}
                        onContextMenu={() =>
                            onContextMenu(
                                selection.map((index) => releases[index]),
                                releases[index].id
                            )
                        }
                    />
                )
            }
        />
    );
}

function getTotalTracks(releases: ReleaseWithArtistAndTracksAndSubreleases[]) {
    return releases
        .flatMap((rel) => [rel, ...rel.subReleases])
        .reduce((memo, { tracks }) => memo + tracks.length, 0);
}

export function getDefaultKeyHandlers(
    navigate: ReturnType<typeof useNavigate>
) {
    return {
        a: withCurrentSelection((release) =>
            navigate(getArtistLink((release as ReleaseWithArtist).artist))
        ),
        f: withCurrentSelectionId((id) =>
            window.api.system.revealEntityInFinder("release", id)
        ),
        i: withCurrentSelection((release) =>
            window.api.system.importCovers([release as ReleaseWithArtist])
        ),
        t: withCurrentSelectionId(window.api.system.openTagger),
        d: withCurrentSelection(window.api.links.searchReleaseOnDiscogs),
        r: withCurrentSelection(window.api.links.searchReleaseOnRYM),
    };
}
