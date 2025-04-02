import type { OpenDialogSyncOptions } from 'electron';
import type { QueryKey } from '@tanstack/react-query';
import { PrismaClient } from '@prisma/client';
import * as search from '@/main/db/search';
import * as release from '@/main/db/release';
import * as artist from '@/main/db/artist';
import * as collection from '@/main/db/collection';
import { playback, downloadCover, startDrag, importCovers, renameRelease } from '@/main/system';
import { getSettings, setSettings } from '@/main/settings';
import type { ReleaseWithArtist, Artist, Collection, SearchResult, Sidebars, ReleaseWithArtistAndSubreleases } from './types';

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
  renameRelease
};

const settings = { getSettings, setSettings };

declare global {
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
  const MAIN_WINDOW_VITE_NAME: string | undefined;
  const prisma: PrismaClient | undefined;
  interface Window {
    api: {
      data: typeof search & typeof release & typeof artist & typeof collection,
      system: typeof system,
      settings: typeof settings,
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
      onNavigateSidebar: (handler: (sidebar: Sidebars) => void) => () => void;
      onMutate: (handler: (keys: QueryKey) => void) => () => void;
      onClearSelection: (handler: () => void) => () => void;
      onToggleViewMode: (handler: () => void) => () => void;
      onToggleSidebar: (handler: (showSidebar: boolean) => void) => () => void;
      onOpenSettings: (handler: () => void) => () => void;
      onCoverUpdate: (handler: (releases: Release[]) => void) => () => void;
      onOpenGroupDialog: (handler: (releases: Release[]) => void) => () => void;
      onOpenRenameDialog: (handler: (release: ReleaseWithArtistAndSubreleases) => void) => () => void;
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