import { useEffect, useRef } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  matchPath,
} from "react-router";
import { ToastContainer, toast } from "react-toastify";
import {
  useKeyManager,
  withMeta,
  KeyManager,
} from "./hooks/useKeyboardManager";
import { useApiEvents } from "./hooks/useApiEvents";
import api from "./api";
import useRefetch from "./hooks/useRefetch";
import useStore from "./store";
import { refreshCovers } from "@/lib/utils";

import Nav from "./components/Nav";
import Modal from "./Modal";
import ToastView from "./components/ToastView";

import { routes } from "./routes";

import HomePage from "./pages/HomePage";
import ReleasesPage from "./pages/ReleasesPage";
import ReleasePage from "./pages/ReleasePage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistPage from "./pages/ArtistPage";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionPage from "./pages/CollectionPage";
import GroupsPage from "./pages/GroupsPage";
import GroupPage from "./pages/GroupPage";

import cx from "clsx";
import styles from "./Layout.module.css";

const routesMap = {
  home: <HomePage />,
  releases: <ReleasesPage />,
  release: <ReleasePage />,
  artists: <ArtistsPage />,
  artist: <ArtistPage />,
  collections: <CollectionsPage />,
  collection: <CollectionPage />,
  groups: <GroupsPage />,
  group: <GroupPage />,
};

export default function Layout() {
  const { setContext, isDetailPage } = useLayout();

  return (
    <div
      className={cx(styles.view, {
        [styles.isDetailPage]: isDetailPage,
      })}
    >
      <Nav isDetailPage={isDetailPage} />
      <div className={styles.page}>
        <main className={styles.main}>
          <Routes>
            {routes.map(({ path, id }) => (
              <Route
                path={path}
                element={routesMap[id as keyof typeof routesMap]}
              />
            ))}
          </Routes>
        </main>
      </div>
      <Modal setContext={setContext} />
      <ToastContainer />
    </div>
  );
}

type UseLayout = {
  setContext: (context: string) => void;
  isDetailPage: boolean;
};

function useLayout(): UseLayout {
  const firstRender = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();
  const refetch = useRefetch();
  const { path, setPath, setSettings, setModalContents, modalContents } =
    useStore();

  useApiEvents({
    onMutate: refetch,
    onNotify: (data) =>
      toast(ToastView, {
        data,
        position: "bottom-right",
        closeButton: false,
        autoClose: 1500,
      }),
    onCoverUpdate: refreshCovers,
    onSwipe: navigate,
    onOpenModal: setModalContents,
    onToggleSearch: () =>
      setModalContents(
        modalContents?.name === "search" ? null : { name: "search" }
      ),
    onNavigate: (path: string) => {
      navigate(path);
      setContext("list");
    },
  });

  const { setContext, currentContext } = useKeyManager({
    context: KeyManager.global,
    handlers: {
      ArrowLeft: withMeta((event: KeyboardEvent) => {
        if (
          currentContext.includes("modal") ||
          currentContext.includes("input")
        ) {
          return;
        }
        event.preventDefault();
        navigate(-1);
      }),
      ArrowRight: withMeta((event: KeyboardEvent) => {
        if (
          currentContext.includes("modal") ||
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
    api.menu.refresh();
    api.settings.getSettings().then(setSettings);
    setContext("list");
  }, []);

  const isDetailPage = !!(
    matchPath("/releases/:id", location.pathname) ||
    matchPath("/artists/:id", location.pathname)
  );

  return {
    setContext,
    isDetailPage,
  };
}
