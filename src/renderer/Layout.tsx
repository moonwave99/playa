import { useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import {
    useKeyManager,
    withMeta,
    withPrevent,
    KeyManager,
} from "./hooks/useKeyboardManager";
import useStore from "./store";

import LatestReleases from "./pages/LatestReleases/LatestReleases";
import LatestArtists from "./pages/LatestArtists/LatestArtists";
import LatestCollections from "./pages/LatestCollections/LatestCollections";
import ReleasePage from "./pages/ReleasePage/ReleasePage";
import ArtistPage from "./pages/ArtistPage/ArtistPage";
import CollectionPage from "./pages/CollectionPage/CollectionPage";
import Nav from "./components/Nav";
import SidebarView from "./components/SidebarView";

import cx from "clsx";
import styles from "./Layout.module.css";

export default function Layout() {
    init();
    return (
        <div className={cx(styles.main, { [styles.hasSidebar]: true })}>
            <div className={styles.page}>
                <div className={styles.sidebar}>
                    <SidebarView />
                    <Nav />
                </div>
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
        </div>
    );
}

function init() {
    const firstRender = useRef(true);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { path, toggleViewMode, setPath } = useStore();
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
        setPath(pathname);
    }, [pathname]);

    useEffect(() => {
        setContext("list");
        const removeHandlers = [
            window.api.onToggleViewMode(toggleViewMode),
            window.api.onMutate((queryKey: QueryKey) =>
                queryClient.refetchQueries({ queryKey })
            ),
            window.api.onNavigate((path: string) => {
                navigate(path);
                setContext("list");
            }),
        ];
        return () => {
            removeHandlers.forEach((removeHandler) => removeHandler());
        };
    }, []);
}
