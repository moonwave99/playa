import type { OpenDialogSyncOptions } from "electron";
import type { QueryKey } from "@tanstack/react-query";
import { PrismaClient } from "@prisma/client";
import { getSettings, setSettings } from "@/main/settings";
import type {
  Artist,
  ReleaseWithArtist,
  ArtistWithReleases,
  Collection,
  SearchResult,
  Sidebars,
  ReleaseWithArtistAndSubreleases,
  GroupWithArtists,
  Notification,
} from "./types";

import { artistController } from "@/main/controllers/artist";
import { releaseController } from "@/main/controllers/release";
import { collectionController } from "@/main/controllers/collection";
import { groupController } from "@/main/controllers/group";
import { systemController } from "@/main/controllers/system";
import { statsController } from "@/main/controllers/stats";
import { searchResultController } from "@/main/controllers/searchResult";
import { importExportController } from "@/main/controllers/importExport";

declare module "*.module.css";

const system = {
  revealEntityInFinder,
  openTagger,
  refreshReleaseContents,
  playback,
  openTagger,
  downloadCover,
  startDrag,
  importCovers,
  editRelease,
  editArtist,
};

declare global {
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
  const MAIN_WINDOW_VITE_NAME: string | undefined;
  const prisma: PrismaClient | undefined;
  interface Window {
    api: {
      searchResult: ReturnType<typeof searchResultController>;
      stats: ReturnType<typeof statsController>;
      release: ReturnType<typeof releaseController>;
      artist: ReturnType<typeof artistController>;
      collection: ReturnType<typeof collectionController>;
      group: ReturnType<typeof groupController>;
      system: ReturnType<typeof systemController>;
      importExport: ReturnType<typeof importExportController> & {
        onProgress: (
          handler: (step: string, completed?: boolean) => void
        ) => () => void;
        onError: (handler: (message: string) => void) => () => void;
      };
      settings: {
        getSettings: () => Promise<ReturnType<getSettings>>;
        setSettings: (
          ...params: Parameters<typeof setSettings>
        ) => Promise<ReturnType<setSettings>>;
      };
      menu: {
        release: (
          selection: ReleaseWithArtist[],
          context?: CollectionWithReleases | ArtistWithReleases
        ) => void;
        artist: (artist: Artist, context?: GroupWithArtists) => void;
        collection: (collection: Collection) => void;
        group: (group: Group) => void;
        searchResult: (result: SearchResult) => void;
      };
      onNavigate: (handler: (path: string) => void) => () => void;
      onSwipe: (handler: (direction: 1 | -1) => void) => () => void;
      onNavigateSidebar: (handler: (sidebar: Sidebars) => void) => () => void;
      onMutate: (handler: (keys: QueryKey) => void) => () => void;
      onNotify: (handler: (notification: Notification) => void) => () => void;
      onClearSelection: (handler: () => void) => () => void;
      onToggleViewMode: (handler: () => void) => () => void;
      onToggleSidebar: (handler: (showSidebar: boolean) => void) => () => void;
      onOpenSettings: (handler: () => void) => () => void;
      onOpenImportData: (handler: () => void) => () => void;
      onOpenStats: (handler: () => void) => () => void;
      onCoverUpdate: (handler: (releases: Release[]) => void) => () => void;
      onOpenGroupDialog: (handler: (releases: Release[]) => void) => () => void;
      onOpenEditReleaseDialog: (
        handler: (release: ReleaseWithArtistAndSubreleases) => void
      ) => () => void;
      onOpenEditArtistDialog: (
        handler: (artist: ArtistWithReleases) => void
      ) => () => void;
      state: {
        selectReleases: (
          selectedReleases: ReleaseWithArtistAndSubreleases[]
        ) => void;
        setInputFocused: (inputFocused: boolean) => void;
        navigate: (path: string) => void;
        clearSelection: () => void;
        refreshCurrentArtist: () => void;
        refreshMenu: () => void;
        toggleSidebar: (showSidebar?: boolean) => void;
      };
      dialog: {
        open: (options: Partial<OpenDialogSyncOptions>) => Promise<string>;
      };
    };
  }
}
