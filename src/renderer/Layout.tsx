import { useEffect, useRef, useState } from "react";
import {
    Routes,
    Route,
    useNavigate,
    useLocation,
    matchPath,
} from "react-router";
import { useMediaQuery } from "react-responsive";
import Modal from "react-modal";
import {
    DndContext,
    DragOverlay,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import {
    useKeyManager,
    withMeta,
    KeyManager,
} from "./hooks/useKeyboardManager";
import {
    useOnOpenSettings,
    useOnOpenGroupDialog,
    useOnOpenEditReleaseDialog,
    useOnOpenEditArtistDialog,
    useOnSwipe,
} from "./hooks/ipc";
import api from "./api";
import useRefetch from "./hooks/useRefetch";
import useStore from "./store";
import type { ModalContents } from "./store";
import { refreshCovers } from "@/lib/utils";
import { handleDropEnd, fixCursorSnapOffset } from "./dnd";

import LatestReleases from "./pages/LatestReleases";
import LatestArtists from "./pages/LatestArtists";
import LatestCollections from "./pages/LatestCollections";
import ReleasePage from "./pages/ReleasePage";
import ArtistPage from "./pages/ArtistPage";
import CollectionPage from "./pages/CollectionPage";
import GroupPage from "./pages/GroupPage";
import LatestGroups from "./pages/LatestGroups";
import Nav from "./components/Nav";
import SidebarView from "./components/SidebarView";
import SettingsView from "./components/SettingsView";
import GroupReleasesView from "./components/GroupReleasesView";
import EditReleaseView from "./components/EditReleaseView";
import EditArtistView from "./components/EditArtistView";
import CoverLightbox from "./components/CoverLightbox";

import { MdOutlineSearch } from "react-icons/md";
import cx from "clsx";
import styles from "./Layout.module.css";
import buttonStyles from "./buttons.module.css";
import dragStyles from "./dnd.module.css";
import {
    Artist,
    ArtistWithReleases,
    Release,
    ReleaseWithArtist,
    ReleaseWithArtistAndSubreleases,
} from "@/types/types";

function getModalOverrides(name: string) {
    if (name === "editArtist") {
        return {
            width: "max(60vw, 800px)",
        };
    }
    if (name === "lightbox") {
        return {
            width: "min(70vw, 80vh)",
            overflow: "visible",
            border: "none",
            background: "transparent",
        };
    }
    return {};
}

function getModalStyle(name: string) {
    const modalStyle = {
        overlay: {
            background: "rgba(100,100,100, 0.1)",
            backdropFilter: "blur(3px)",
            zIndex: 2,
        },
        content: {
            background: "black",
            width: "max(40vw, 600px)",
            height: "min-content",
            margin: "auto",
            borderColor: "var(--tertiary-color)",
            borderRadius: ".5rem",
            padding: name === "lightbox" ? 0 : "1.5rem",
            ...getModalOverrides(name),
        },
    };
    return modalStyle;
}

Modal.setAppElement("#root");

export default function Layout() {
    const {
        showSidebar,
        useDarkText,
        toggleSidebar,
        modalContents,
        clearModalContents,
        closeModal,
        isModalOpen,
        setContext,
        isDetailPage,
        onDragStart,
        onDragEnd,
        draggedItem,
    } = init();

    return (
        <DndContext
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            collisionDetection={fixCursorSnapOffset}
        >
            <div
                className={cx(styles.main, {
                    [styles.showSidebar]: showSidebar,
                    [styles.isDetailPage]: isDetailPage,
                })}
            >
                <button
                    aria-label="Toggle Sidebar"
                    onClick={() => toggleSidebar()}
                    className={cx(
                        buttonStyles.button,
                        styles.toggleSidebarButton,
                        {
                            [styles.showSidebar]: showSidebar,
                            [buttonStyles.useDarkText]: useDarkText,
                        }
                    )}
                >
                    <MdOutlineSearch />
                </button>
                <Nav />
                <div className={styles.page}>
                    {showSidebar && (
                        <div className={styles.sidebar}>
                            <SidebarView />
                        </div>
                    )}
                    <main className={styles.main}>
                        <Routes>
                            <Route path="/" element={<LatestReleases />} />
                            <Route
                                path="/releases/:id"
                                element={<ReleasePage />}
                            />
                            <Route
                                path="/collections"
                                element={<LatestCollections />}
                            />
                            <Route
                                path="/collections/:id"
                                element={<CollectionPage />}
                            />
                            <Route path="/groups" element={<LatestGroups />} />
                            <Route path="/groups/:id" element={<GroupPage />} />
                            <Route
                                path="/artists"
                                element={<LatestArtists />}
                            />
                            <Route
                                path="/artists/:id"
                                element={<ArtistPage />}
                            />
                        </Routes>
                    </main>
                </div>
                <Modal
                    closeTimeoutMS={300}
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    style={getModalStyle(modalContents?.name)}
                    onAfterOpen={() => {
                        api.state.setInputFocused(true);
                        setContext("modal");
                    }}
                    onAfterClose={() => {
                        api.state.setInputFocused(false);
                        setContext("list");
                        clearModalContents();
                    }}
                >
                    {modalContents?.name === "settings" && (
                        <SettingsView
                            onSave={closeModal}
                            onCancel={closeModal}
                        />
                    )}
                    {modalContents?.name === "groupReleases" && (
                        <GroupReleasesView
                            releases={
                                modalContents.params
                                    .releases as ReleaseWithArtist[]
                            }
                            onSave={closeModal}
                            onCancel={closeModal}
                        />
                    )}
                    {modalContents?.name === "editRelease" && (
                        <EditReleaseView
                            release={
                                modalContents.params
                                    .release as ReleaseWithArtistAndSubreleases
                            }
                            onSave={closeModal}
                            onCancel={closeModal}
                        />
                    )}
                    {modalContents?.name === "editArtist" && (
                        <EditArtistView
                            artist={
                                modalContents.params
                                    .artist as ArtistWithReleases
                            }
                            onSave={closeModal}
                            onCancel={closeModal}
                        />
                    )}
                    {modalContents?.name === "lightbox" && (
                        <CoverLightbox
                            onClose={closeModal}
                            release={
                                modalContents.params
                                    .release as ReleaseWithArtist
                            }
                            context={
                                modalContents.params
                                    .context as ReleaseWithArtist[]
                            }
                        />
                    )}
                </Modal>
            </div>
            <DragOverlay modifiers={[snapCenterToCursor]}>
                {draggedItem && <div className={dragStyles.DragOverlay}>1</div>}
            </DragOverlay>
        </DndContext>
    );
}

type Init = {
    showSidebar: boolean;
    useDarkText: boolean;
    modalContents: ModalContents;
    isModalOpen: boolean;
    closeModal: () => void;
    clearModalContents: () => void;
    setContext: (context: string) => void;
    toggleSidebar: () => void;
    isDetailPage: boolean;
    draggedItem: Artist | Release | null;
    onDragStart: (event: DragStartEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
};

function init(): Init {
    const firstRender = useRef(true);
    const navigate = useNavigate();
    const location = useLocation();
    const refetch = useRefetch();
    const {
        path,
        toggleViewMode,
        setPath,
        showSidebar,
        modalContents,
        setModalContents,
        toggleSidebar,
        useDarkText,
        setSettings,
    } = useStore();

    const isSmallScreen = useMediaQuery({
        query: "(max-width: 900px)",
    });

    const [draggedItem, setDraggedItem] = useState<Artist | Release>(null);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (isSmallScreen) {
            toggleSidebar(false);
        }
    }, [isSmallScreen]);

    useOnOpenSettings(() => setModalContents({ name: "settings" }));
    useOnOpenGroupDialog((releases: ReleaseWithArtist[]) =>
        setModalContents({ name: "groupReleases", params: { releases } })
    );
    useOnOpenEditReleaseDialog((release: ReleaseWithArtistAndSubreleases) =>
        setModalContents({ name: "editRelease", params: { release } })
    );
    useOnOpenEditArtistDialog((artist: ArtistWithReleases) =>
        setModalContents({ name: "editArtist", params: { artist } })
    );
    useOnSwipe(navigate);

    const isDetailPage = !!(
        matchPath("/releases/:id", location.pathname) ||
        matchPath("/artists/:id", location.pathname)
    );

    const { setContext, currentContext } = useKeyManager({
        context: KeyManager.global,
        handlers: {
            ArrowLeft: withMeta((event: KeyboardEvent) => {
                if (
                    currentContext === "modal" ||
                    currentContext.includes("input")
                ) {
                    return;
                }
                event.preventDefault();
                navigate(-1);
            }),
            ArrowRight: withMeta((event: KeyboardEvent) => {
                if (
                    currentContext === "modal" ||
                    currentContext.includes("input")
                ) {
                    return;
                }
                event.preventDefault();
                navigate(1);
            }),
        },
    });

    useEffect(() => {
        if (!firstRender.current) {
            return;
        }
        firstRender.current = false;
        navigate(path);
    }, [path]);

    useEffect(() => {
        if (firstRender.current) {
            return;
        }
        const fullLocation =
            location.search && !location.search.includes("new=true")
                ? `${location.pathname}${location.search}`
                : location.pathname;

        api.state.navigate(fullLocation);
        setPath(fullLocation);
    }, [location]);

    useEffect(() => {
        api.state.setInputFocused(false);
        api.state.refreshMenu();
        setContext("list");

        const removeHandlers = [
            api.onToggleViewMode(toggleViewMode),
            api.onMutate(refetch),
            api.onNavigate((path: string) => {
                navigate(path);
                setContext("list");
            }),
            api.onCoverUpdate(refreshCovers),
            api.onToggleSidebar(toggleSidebar),
        ];

        api.settings.getSettings().then(setSettings);

        return () => {
            removeHandlers.forEach((x) => x());
        };
    }, []);

    useEffect(() => {
        setModalOpen(!!modalContents);
    }, [modalContents]);

    function closeModal() {
        setModalOpen(false);
    }

    function clearModalContents() {
        setModalContents(null);
    }

    function onDragStart(event: DragStartEvent) {
        setDraggedItem(event.active.data.current as Artist | Release);
    }

    async function onDragEnd(event: DragEndEvent) {
        await handleDropEnd(event, refetch);
        setDraggedItem(null);
    }

    return {
        showSidebar,
        useDarkText,
        toggleSidebar,
        draggedItem,
        modalContents,
        isModalOpen,
        closeModal,
        clearModalContents,
        setContext,
        isDetailPage,
        onDragStart,
        onDragEnd,
    };
}
