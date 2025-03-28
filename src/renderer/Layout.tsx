import { useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import Modal from "react-modal";
import {
    useKeyManager,
    withMeta,
    withPrevent,
    KeyManager,
} from "./hooks/useKeyboardManager";
import { useOnOpenSettings } from "./hooks/ipc";
import useStore from "./store";
import type { ModalContents } from "./store";
import { refreshCovers } from "@/lib/utils";

import LatestReleases from "./pages/LatestReleases/LatestReleases";
import LatestArtists from "./pages/LatestArtists/LatestArtists";
import LatestCollections from "./pages/LatestCollections/LatestCollections";
import ReleasePage from "./pages/ReleasePage/ReleasePage";
import ArtistPage from "./pages/ArtistPage/ArtistPage";
import CollectionPage from "./pages/CollectionPage/CollectionPage";
import Nav from "./components/Nav";
import SidebarView from "./components/SidebarView";
import SettingsView from "./components/SettingsView";

import { GoSidebarExpand, GoSidebarCollapse } from "react-icons/go";
import cx from "clsx";
import styles from "./Layout.module.css";

const modalStyle = {
    overlay: {
        background: "rgba(100,100,100, 0.1)",
        backdropFilter: "blur(3px)",
        zIndex: 2,
    },
    content: {
        background: "black",
        width: "60vw",
        height: "min-content",
        margin: "auto",
        borderColor: "var(--tertiary-color)",
        borderRadius: ".5rem",
    },
};

Modal.setAppElement("#root");

export default function Layout() {
    const {
        showSidebar,
        toggleSidebar,
        modalContents,
        setModalContents,
        setContext,
    } = init();
    useOnOpenSettings(() => setModalContents({ name: "settings" }));

    return (
        <div className={cx(styles.main, { [styles.hasSidebar]: true })}>
            <button
                aria-label="Toggle Sidebar"
                onClick={toggleSidebar}
                className={cx(styles.toggleSidebarButton, {
                    [styles.showSidebar]: showSidebar,
                })}
            >
                {showSidebar ? <GoSidebarCollapse /> : <GoSidebarExpand />}
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
                        <Route path="/releases/:id" element={<ReleasePage />} />
                        <Route
                            path="/collections"
                            element={<LatestCollections />}
                        />
                        <Route
                            path="/collections/:id"
                            element={<CollectionPage />}
                        />
                        <Route path="/artists" element={<LatestArtists />} />
                        <Route path="/artists/:id" element={<ArtistPage />} />
                    </Routes>
                </main>
            </div>
            <Modal
                isOpen={!!modalContents}
                onRequestClose={() => setModalContents(null)}
                style={modalStyle}
                onAfterOpen={() => {
                    window.api.ui.inputFocus();
                    setContext("modal");
                }}
                onAfterClose={() => {
                    window.api.ui.inputBlur();
                    setContext("list");
                }}
            >
                {modalContents?.name === "settings" && (
                    <SettingsView
                        onSave={() => setModalContents(null)}
                        onCancel={() => setModalContents(null)}
                    />
                )}
            </Modal>
        </div>
    );
}

type Init = {
    showSidebar: boolean;
    modalContents: ModalContents;
    setModalContents: (modalContents: ModalContents) => void;
    setContext: (context: string) => void;
    toggleSidebar: () => void;
};

function init(): Init {
    const firstRender = useRef(true);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {
        path,
        toggleViewMode,
        setPath,
        showSidebar,
        modalContents,
        setModalContents,
        toggleSidebar,
    } = useStore();
    const { pathname } = useLocation();

    const { setContext } = useKeyManager({
        context: KeyManager.global,
        handlers: {
            ArrowLeft: withMeta(withPrevent(() => navigate(-1))),
            ArrowRight: withMeta(withPrevent(() => navigate(1))),
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
        window.api.state.navigate(pathname);
        setPath(pathname);
    }, [pathname]);

    useEffect(() => {
        setContext("list");
        const removeHandlers = [
            window.api.onToggleViewMode(toggleViewMode),
            window.api.onMutate((queryKey: QueryKey) => {
                Array.isArray(queryKey[0])
                    ? queryKey.forEach((q: QueryKey) =>
                          queryClient.refetchQueries({ queryKey: q })
                      )
                    : queryClient.refetchQueries({ queryKey });
            }),
            window.api.onNavigate((path: string) => {
                navigate(path);
                setContext("list");
            }),
            window.api.onCoverUpdate(refreshCovers),
            window.api.onToggleSidebar(toggleSidebar),
        ];
        return () => {
            removeHandlers.forEach((removeHandler) => removeHandler());
        };
    }, []);

    return {
        showSidebar,
        toggleSidebar,
        modalContents,
        setModalContents,
        setContext,
    };
}
