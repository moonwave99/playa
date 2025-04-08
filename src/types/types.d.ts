import type { OpenDialogSyncOptions } from 'electron';
import type { QueryKey } from '@tanstack/react-query';
import { PrismaClient } from '@prisma/client';
import { getSettings, setSettings } from '@/main/settings';
import type {
  Artist,
  ReleaseWithArtist,
  ArtistWithReleases,
  Collection,
  SearchResult,
  Sidebars,
  ReleaseWithArtistAndSubreleases
} from './types';

import { artistController } from '@/main/controllers/artist';
import { releaseController } from '@/main/controllers/release';
import { collectionController } from '@/main/controllers/collection';
import { systemController } from '@/main/controllers/system';
import { searchController } from '@/main/controllers/search';

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
  editArtist
};

declare global {
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
  const MAIN_WINDOW_VITE_NAME: string | undefined;
  const prisma: PrismaClient | undefined;
  interface Window {
    api: {
      search: ReturnType<typeof searchController>,
      release: ReturnType<typeof releaseController>,
      artist: ReturnType<typeof artistController>,
      collection: ReturnType<typeof collectionController>,
      system: ReturnType<typeof systemController>,
      settings: {
        getSettings: () => Promise<ReturnType<typeof getSettings>>,
        setSettings: () => Promise<ReturnType<typeof setSettings>>,
      },
      menu: {
        release: (
          selection: ReleaseWithArtist[],
          targetIndex: number,
          context?: CollectionWithReleases | ArtistWithReleases
        ) => void;
        artist: (artist: Artist) => void;
        collection: (collection: Collection) => void;
        searchResult: (result: SearchResult) => void;
      }
      onNavigate: (handler: (path: string) => void) => () => void;
      onSwipe: (handler: (direction: 1 | -1) => void) => () => void;
      onNavigateSidebar: (handler: (sidebar: Sidebars) => void) => () => void;
      onMutate: (handler: (keys: QueryKey) => void) => () => void;
      onClearSelection: (handler: () => void) => () => void;
      onToggleViewMode: (handler: () => void) => () => void;
      onToggleSidebar: (handler: (showSidebar: boolean) => void) => () => void;
      onOpenSettings: (handler: () => void) => () => void;
      onCoverUpdate: (handler: (releases: Release[]) => void) => () => void;
      onOpenGroupDialog: (handler: (releases: Release[]) => void) => () => void;
      onOpenEditReleaseDialog: (handler: (release: ReleaseWithArtistAndSubreleases) => void) => () => void;
      onOpenEditArtistDialog: (handler: (artist: ArtistWithReleases) => void) => () => void;
      state: {
        selectReleases: (selectedReleases: ReleaseWithArtistAndSubreleases[]) => void;
        setInputFocused: (inputFocused: boolean) => void;
        navigate: (path: string) => void;
        clearSelection: () => void;
        toggleSidebar: (showSidebar?: boolean) => void;
      },
      dialog: {
        open: (options: Partial<OpenDialogSyncOptions>) => Promise<string>;
      }
    }
  }
}