import { useEffect } from 'react';
import type { Artist, ReleaseWithArtist, ReleaseWithArtistAndSubreleases, Sidebars } from "@/types/types";

export function useClearSelection(callback: () => void) {
  useEffect(() => {
    const unsubscribe = window.api.onClearSelection(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useNavigateSidebar(callback: (sidebar: Sidebars) => void) {
  useEffect(() => {
    const unsubscribe = window.api.onNavigateSidebar(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenSettings(callback: () => void) {
  useEffect(() => {
    const unsubscribe = window.api.onOpenSettings(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenGroupDialog(callback: (selection: ReleaseWithArtist[]) => void) {
  useEffect(() => {
    const unsubscribe = window.api.onOpenGroupDialog(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenEditReleaseDialog(callback: (release: ReleaseWithArtistAndSubreleases) => void) {
  useEffect(() => {
    const unsubscribe = window.api.onOpenEditReleaseDialog(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenEditArtistDialog(callback: (artist: Artist) => void) {
  useEffect(() => {
    const unsubscribe = window.api.onOpenEditArtistDialog(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useClearSelectionOnLeave() {
  useEffect(() => {
    return () => {
      window.api.state.selectReleases([])
    };
  }, []);
}