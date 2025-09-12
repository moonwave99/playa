import { useEffect, useRef, useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  matchPath,
} from "react-router";
import { useMediaQuery } from "react-responsive";
import { ToastContainer, toast } from "react-toastify";
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
  useOnOpenStats,
  useOnOpenImportData,
} from "./hooks/ipc";
import api from "./api";
import useRefetch from "./hooks/useRefetch";
import useStore from "./store";
import { refreshCovers } from "@/lib/utils";
import { handleDropEnd, fixCursorSnapOffset } from "./dnd";

import ReleasesPage from "./pages/ReleasesPage";
import ArtistsPage from "./pages/ArtistsPage";
import CollectionsPage from "./pages/CollectionsPage";
import GroupsPage from "./pages/GroupsPage";
import ReleasePage from "./pages/ReleasePage";
import ArtistPage from "./pages/ArtistPage";
import CollectionPage from "./pages/CollectionPage";
import GroupPage from "./pages/GroupPage";

import Nav from "./components/Nav";
import SidebarView from "./components/SidebarView";
import Modal from "./Modal";
import ToastView from "./components/ToastView";

import { MdOutlineSearch } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import cx from "clsx";
import styles from "./Layout.module.css";
import buttonStyles from "./buttons.module.css";
import dragStyles from "./dnd.module.css";
import {
  Artist,
  ArtistWithReleases,
  Release,
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
  Notification,
} from "@/types/types";

export default function Layout() {
  const {
    showSidebar,
    useDarkText,
    toggleSidebar,
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
          className={cx(buttonStyles.button, styles.toggleSidebarButton, {
            [styles.showSidebar]: showSidebar,
            [buttonStyles.useDarkText]: useDarkText,
          })}
        >
          {showSidebar ? <IoClose /> : <MdOutlineSearch />}
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
              <Route path="/" element={<ReleasesPage />} />
              <Route path="/releases/:id" element={<ReleasePage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:id" element={<CollectionPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/groups/:id" element={<GroupPage />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/artists/:id" element={<ArtistPage />} />
            </Routes>
          </main>
        </div>
        <Modal setContext={setContext} />
        <ToastContainer />
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
    toggleSidebar,
    useDarkText,
    setSettings,
    setModalContents,
  } = useStore();

  const isSmallScreen = useMediaQuery({
    query: "(max-width: 900px)",
  });

  const [draggedItem, setDraggedItem] = useState<Artist | Release>(null);

  useEffect(() => {
    if (isSmallScreen) {
      toggleSidebar(false);
    }
  }, [isSmallScreen]);

  useOnOpenSettings(() => setModalContents({ name: "settings" }));
  useOnOpenImportData(() => setModalContents({ name: "importData" }));
  useOnOpenStats(() => setModalContents({ name: "stats" }));
  useOnOpenGroupDialog((releases: ReleaseWithArtist[]) =>
    setModalContents({ name: "groupReleases", params: { releases } })
  );
  useOnOpenEditReleaseDialog((release: ReleaseWithArtistAndSubReleases) =>
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
        if (currentContext === "modal" || currentContext.includes("input")) {
          return;
        }
        event.preventDefault();
        navigate(-1);
      }),
      ArrowRight: withMeta((event: KeyboardEvent) => {
        if (currentContext === "modal" || currentContext.includes("input")) {
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

  function onNotification(data: Notification) {
    toast(ToastView, {
      data,
      position: "bottom-right",
      closeButton: false,
      autoClose: 1500,
    });
  }

  useEffect(() => {
    api.state.setInputFocused(false);
    api.state.refreshMenu();
    setContext("list");

    const removeHandlers = [
      api.onToggleViewMode(toggleViewMode),
      api.onMutate(refetch),
      api.onNotify(onNotification),
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
    setContext,
    isDetailPage,
    onDragStart,
    onDragEnd,
  };
}
