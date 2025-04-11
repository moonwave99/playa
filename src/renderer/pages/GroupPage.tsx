import {
    useParams,
    useSearchParams,
    Navigate,
    useNavigate,
} from "react-router";
import api from "../api";
import type { ArtistWithReleases } from "@/types/types";
import useGroup from "../query/useGroup";
import useStore from "../store";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import { useClearSelectionOnLeave } from "@/renderer/hooks/ipc";
import { getArtistLink } from "@/lib/links";
import { estimateListCardSize } from "@/lib/utils";
import Loading from "@/renderer/components/Loading";
import List from "../components/List";
import ListCard from "../components/ListCard";
import EditableHeader from "../components/EditableHeader";
import Droppable from "../components/Droppable";
import styles from "./Page.module.css";

const columnsConfig = [
    { count: 3, width: 900 },
    { count: 2, width: 600 },
];

export default function GroupPage() {
    const navigate = useNavigate();
    const { showSidebar } = useStore();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { setContext } = useKeyManager();
    const { group, isPending, error, updateTitle, deleteArtistsFromGroup } =
        useGroup(+id);

    useClearSelectionOnLeave();

    if (isPending) {
        return <Loading />;
    }

    if (error) return "An error has occurred: " + error.message;

    if (!group) {
        return <Navigate replace to="/groups" />;
    }

    function onDelete(selection: ArtistWithReleases[], event: KeyboardEvent) {
        if (!event.metaKey) {
            return;
        }
        deleteArtistsFromGroup(selection);
    }

    return (
        <div className={styles.page}>
            <EditableHeader
                item={group}
                onTitleUpdate={updateTitle}
                isFocused={!!searchParams.get("new")}
                onContextMenu={() => api.menu.group(group)}
            />
            <Droppable item={group}>
                {!group?.artists.length ? (
                    <div className={styles.placeholder}>
                        There are no artists in this group yet.
                    </div>
                ) : (
                    <List
                        shouldPreventSpace
                        items={group.artists}
                        className={styles.list}
                        columnsConfig={columnsConfig}
                        estimateSize={estimateListCardSize}
                        onEnter={(artist: ArtistWithReleases) =>
                            navigate(getArtistLink(artist))
                        }
                        onBackspace={onDelete}
                        onLeft={() => setContext("sidebar")}
                        shouldCallOnLeft={() => showSidebar}
                        render={({ item, ...rest }) => (
                            <ListCard
                                showMultipleCovers
                                item={item}
                                onContextMenu={() =>
                                    api.menu.artist(item, group)
                                }
                                onCoverDoubleClick={(release_id) =>
                                    api.system.playback({ release_id })
                                }
                                {...rest}
                            />
                        )}
                    />
                )}
            </Droppable>
        </div>
    );
}
