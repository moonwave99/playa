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
import {
  useOnOpenSettings,
  useOnOpenGroupDialog,
  useOnOpenEditReleaseDialog,
  useOnOpenEditArtistDialog,
  useOnOpenEditCollectionDialog,
  useOnSwipe,
  useOnOpenImportData,
  useOnOpenEditGroupDialog,
  useOnToggleSearch,
  useOnExportData,
} from "./hooks/ipc";
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
  ReleaseWithArtistAndSubReleases,
  Notification,
  Collection,
  Group,
} from "@/types/types";

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
              {routes.map(({ path, element }) => (
                <Route path={path} element={element} />
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
    toggleViewMode,
    setPath,
    useDarkText,
    setSettings,
    setModalContents,
    modalContents,
  } = useStore();

  const [draggedItem, setDraggedItem] = useState<Artist | Release>(null);

  useOnOpenSettings(() => setModalContents({ name: "settings" }));
  useOnOpenImportData(() => setModalContents({ name: "importData" }));
  useOnOpenGroupDialog((releases: ReleaseWithArtist[]) =>
    setModalContents({ name: "groupReleases", params: { releases } })
  );
  useOnOpenEditReleaseDialog((release: ReleaseWithArtistAndSubReleases) =>
    setModalContents({ name: "editRelease", params: { release } })
  );
  useOnOpenEditArtistDialog((artist: ArtistWithReleases) =>
    setModalContents({ name: "editArtist", params: { artist } })
  );
  useOnOpenEditCollectionDialog((collection: Collection) =>
    setModalContents({ name: "editCollection", params: { collection } })
  );
  useOnOpenEditGroupDialog((group: Group) =>
    setModalContents({ name: "editGroup", params: { group } })
  );
  useOnExportData(() => setModalContents({ name: "exportData" }));
  useOnToggleSearch(() =>
    setModalContents(
      modalContents?.name === "search" ? null : { name: "search" }
    )
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
    useDarkText,
    draggedItem,
    setContext,
    isDetailPage,
    onDragStart,
    onDragEnd,
  };
}
