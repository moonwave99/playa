import { useEffect, useRef } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  matchPath,
} from "react-router";
import { ToastContainer, toast } from "react-toastify";
import { Settings } from "@/types/types";
import { NOTIFICATION_AUTOCLOSE_INTERVAL } from "@/constants";
import { useKeyManager } from "./hooks/useKeyboardManager";
import { useApiEvents } from "./hooks/useApiEvents";
import useRefetch from "./hooks/useRefetch";
import api from "./api";
import useStore from "./store";
import { refreshCovers } from "@/lib/utils";
import { routes } from "./routes";

import Nav from "./components/Nav/Nav";
import Modal from "./Modal";
import ToastView from "./components/ToastView";

import Onboarding from "./pages/Onboarding/Onboarding";
import HomePage from "./pages/HomePage/HomePage";
import ReleasesPage from "./pages/ReleasesPage";
import ReleasePage from "./pages/ReleasePage/ReleasePage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistPage from "./pages/ArtistPage/ArtistPage";
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

type LayoutProps = {
  initialSettings: Settings;
};

export default function Layout({ initialSettings }: LayoutProps) {
  const { setContext, isFullHeaderPage, showOnboarding } = useLayout({
    initialSettings,
  });

  return (
    <>
      {initialSettings.SHOW_ONBOARDING_ON_STARTUP && showOnboarding ? (
        <Onboarding />
      ) : (
        <div
          className={cx(styles.view, {
            [styles.isFullHeaderPage]: isFullHeaderPage,
          })}
          data-testid="App"
        >
          <Nav isFullHeaderPage={isFullHeaderPage} />
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
        </div>
      )}
      <Modal setContext={setContext} />
      <ToastContainer />
    </>
  );
}

type UseLayoutParams = {
  initialSettings: Settings;
};

type UseLayout = {
  setContext: (context: string) => void;
  isFullHeaderPage: boolean;
  showOnboarding: boolean;
};

function useLayout({ initialSettings }: UseLayoutParams): UseLayout {
  const firstRender = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();
  const refetch = useRefetch();
  const {
    path,
    setPath,
    settings,
    setSettings,
    setModalContents,
    setHistoryState,
  } = useStore();

  useApiEvents({
    onMutate: refetch,
    onNotify: (data) =>
      toast(ToastView, {
        data,
        position: "bottom-right",
        closeButton: false,
        autoClose: NOTIFICATION_AUTOCLOSE_INTERVAL,
      }),
    onCoverUpdate: refreshCovers,
    onHistoryChange: (historyState) => {
      setHistoryState(historyState);
      navigate(historyState.currentEntry.href, {
        state: { historyChange: true, direction: historyState.direction },
      });
    },
    onOpenModal: setModalContents,
    onNavigate: (path: string) => {
      if (path === window.location.hash.slice(1)) {
        return;
      }
      navigate(path);
      setContext("list");
    },
    onSettingsUpdate: setSettings,
  });

  const { setContext } = useKeyManager();

  useEffect(() => {
    if (firstRender.current) {
      return;
    }

    const fullLocation =
      location.search && !location.search.includes("new=true")
        ? `${location.pathname}${location.search}`
        : location.pathname;

    setPath(fullLocation);

    if (
      location.state?.isRedirect ||
      location.state?.historyChange ||
      location.state?.firstRender
    ) {
      return;
    }

    api.state.navigate({
      href: fullLocation,
      title: null,
    });
  }, [location]);

  useEffect(() => {
    if (!firstRender.current) {
      return;
    }
    firstRender.current = false;
    navigate(path);
  }, [path]);

  useEffect(() => {
    setSettings(initialSettings);
    setContext("list");
  }, [initialSettings]);

  const isFullHeaderPage = !!(
    matchPath("/releases/:id", location.pathname) ||
    matchPath("/artists/:id", location.pathname)
  );

  return {
    setContext,
    showOnboarding: settings?.SHOW_ONBOARDING_ON_STARTUP,
    isFullHeaderPage,
  };
}
