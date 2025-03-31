import { useEffect } from 'react';
import type { ReleaseWithArtist, ReleaseWithArtistAndSubreleases, Sidebars } from "@/types/types";

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

export function useOnOpenRenameDialog(callback: (release: ReleaseWithArtistAndSubreleases) => void) {
  useEffect(() => {
    const unsubscribe = window.api.onOpenRenameDialog(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useClearSelectionOnLeave() {
  useEffect(() => {
    return () => {
      window.api.state.select([])
    };
  }, []);
}