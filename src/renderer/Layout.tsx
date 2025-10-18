import { useEffect, useRef, useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  matchPath,
} from "react-router";
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
import { useApiEvents } from "./hooks/useApiEvents";
import api from "./api";
import useRefetch from "./hooks/useRefetch";
import useStore from "./store";
import { refreshCovers } from "@/lib/utils";
import { handleDropEnd, fixCursorSnapOffset } from "./dnd";

import { routes } from "./routes";

import Nav from "./components/Nav";
import Modal from "./Modal";
import ToastView from "./components/ToastView";

import cx from "clsx";
import styles from "./Layout.module.css";
import dragStyles from "./dnd.module.css";
import {
  Artist,
  ArtistWithReleases,
  Release,
  ReleaseWithArtist,
  Notification,
  Collection,
  Group,
  ReleaseWithArtistAndTracksAndSubreleases,
  ImportData,
} from "@/types/types";

import HomePage from "./pages/HomePage";
import ReleasesPage from "./pages/ReleasesPage";
import ReleasePage from "./pages/ReleasePage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistPage from "./pages/ArtistPage";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionPage from "./pages/CollectionPage";
import GroupsPage from "./pages/GroupsPage";
import GroupPage from "./pages/GroupPage";

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

function onNotify(data: Notification) {
  toast(ToastView, {
    data,
    position: "bottom-right",
    closeButton: false,
    autoClose: 1500,
  });
}

export default function Layout() {
  const { setContext, isDetailPage, onDragStart, onDragEnd, draggedItem } =
    init();

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      collisionDetection={fixCursorSnapOffset}
    >
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
      <DragOverlay modifiers={[snapCenterToCursor]}>
        {draggedItem && <div className={dragStyles.DragOverlay}>1</div>}
      </DragOverlay>
    </DndContext>
  );
}

type Init = {
  useDarkText: boolean;
  setContext: (context: string) => void;
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
    setPath,
    useDarkText,
    setSettings,
    setModalContents,
    modalContents,
  } = useStore();

  const [draggedItem, setDraggedItem] = useState<Artist | Release>(null);

  useApiEvents({
    onMutate: refetch,
    onNotify,
    onCoverUpdate: refreshCovers,
    onOpenSettings: () => setModalContents({ name: "settings" }),
    onOpenImportFolders: () => setModalContents({ name: "importFolders" }),
    onOpenExportData: () => setModalContents({ name: "exportData" }),
    onOpenImportData: () => setModalContents({ name: "importData" }),
    onOpenGroupDialog: (releases: ReleaseWithArtist[]) =>
      setModalContents({ name: "groupReleases", params: { releases } }),
    onOpenEditReleaseDialog: (
      release: ReleaseWithArtistAndTracksAndSubreleases
    ) => setModalContents({ name: "editRelease", params: { release } }),
    onOpenEditArtistDialog: (artist: ArtistWithReleases) =>
      setModalContents({ name: "editArtist", params: { artist } }),
    onOpenEditCollectionDialog: (collection: Collection) =>
      setModalContents({ name: "editCollection", params: { collection } }),
    onOpenEditGroupDialog: (group: Group) =>
      setModalContents({ name: "editGroup", params: { group } }),
    onOpenAddReleasesToCollectionDialog: (releases: ReleaseWithArtist[]) =>
      setModalContents({
        name: "addReleasesToCollection",
        params: { releases },
      }),
    onOpenAddArtistsToGroupDialog: (artists: ArtistWithReleases[]) =>
      setModalContents({
        name: "addArtistsToGroup",
        params: { artists },
      }),
    onOpenInteractiveImportDialog: (data: ImportData[]) =>
      setModalContents({
        name: "interactiveImport",
        params: { data },
      }),
    onToggleSearch: () =>
      setModalContents(
        modalContents?.name === "search" ? null : { name: "search" }
      ),
    onSwipe: navigate,
    onNavigate: (path: string) => {
      navigate(path);
      setContext("list");
    },
  });

  const isDetailPage = !!(
    matchPath("/releases/:id", location.pathname) ||
    matchPath("/artists/:id", location.pathname)
  );

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

  function onDragStart(event: DragStartEvent) {
    setDraggedItem(event.active.data.current as Artist | Release);
  }

  async function onDragEnd(event: DragEndEvent) {
    await handleDropEnd(event, refetch);
    setDraggedItem(null);
  }

  return {
    useDarkText,
    draggedItem,
    setContext,
    isDetailPage,
    onDragStart,
    onDragEnd,
  };
}
