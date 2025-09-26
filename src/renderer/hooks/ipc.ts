import { useEffect } from "react";
import api from "../api";
import type {
  Artist,
  Collection,
  Group,
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
  Sidebars,
} from "@/types/types";

export function useClearSelection(callback: () => void) {
  useEffect(() => {
    const unsubscribe = api.onClearSelection(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useNavigateSidebar(callback: (sidebar: Sidebars) => void) {
  useEffect(() => {
    const unsubscribe = api.onNavigateSidebar(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnSwipe(callback: (direction: 1 | -1) => void) {
  useEffect(() => {
    const unsubscribe = api.onSwipe(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenSettings(callback: () => void) {
  useEffect(() => {
    const unsubscribe = api.onOpenSettings(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenImportData(callback: () => void) {
  useEffect(() => {
    const unsubscribe = api.onOpenImportData(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenGroupDialog(
  callback: (selection: ReleaseWithArtist[]) => void
) {
  useEffect(() => {
    const unsubscribe = api.onOpenGroupDialog(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenEditReleaseDialog(
  callback: (release: ReleaseWithArtistAndSubReleases) => void
) {
  useEffect(() => {
    const unsubscribe = api.onOpenEditReleaseDialog(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenEditArtistDialog(callback: (artist: Artist) => void) {
  useEffect(() => {
    const unsubscribe = api.onOpenEditArtistDialog(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenEditCollectionDialog(
  callback: (collection: Collection) => void
) {
  useEffect(() => {
    const unsubscribe = api.onOpenEditCollectionDialog(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useOnOpenEditGroupDialog(callback: (group: Group) => void) {
  useEffect(() => {
    const unsubscribe = api.onOpenEditGroupDialog(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}

export function useClearSelectionOnLeave() {
  useEffect(() => {
    return () => {
      api.state.selectReleases([]);
    };
  }, []);
}
