import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ReleaseListViewMode,
  ArtistsViewMode,
  Settings,
} from "@/types/types";
import { Modals } from "./Modal";

export type ModalContents = { name: Modals; params?: Record<string, unknown> };

const viewModes = {
  releaseList: ["grid", "list", "compact"] as ReleaseListViewMode[],
  artists: ["latest", "alphabetical"] as ArtistsViewMode[],
};

function getNextViewMode<T>(entity: keyof typeof viewModes, current: T) {
  const currentIndex = (viewModes[entity] as T[]).indexOf(current);
  return viewModes[entity][(currentIndex + 1) % viewModes[entity].length] as T;
}

type Store = {
  releaseListViewMode: ReleaseListViewMode;
  artistsViewMode: ArtistsViewMode;
  useDarkText: boolean;
  path: string;
  modalContents: ModalContents | null;
  isModalFixed: boolean;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  toggleViewMode: (entity: keyof typeof viewModes) => void;
  setViewMode: (
    entity: keyof typeof viewModes,
    viewMode: ReleaseListViewMode | ArtistsViewMode
  ) => void;
  setUseDarkText: (useDarkText: boolean) => void;
  setPath: (path: string) => void;
  setModalContents: (modalContents: ModalContents) => void;
  setModalFixed: (isModalFixed: boolean) => void;
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      releaseListViewMode: "grid",
      artistsViewMode: "latest",
      path: "/",
      useDarkText: false,
      modalContents: null as ModalContents,
      isModalFixed: false,
      settings: null as Settings,
      setSettings: (settings) => set({ settings }),
      setUseDarkText: (useDarkText) => set({ useDarkText }),
      setPath: (path) => set({ path }),
      setModalContents: (modalContents) => set({ modalContents }),
      setModalFixed: (isModalFixed) => set({ isModalFixed }),
      toggleViewMode: (entity: keyof typeof viewModes) =>
        set((state) => ({
          [`${entity}ViewMode`]: getNextViewMode(
            entity,
            state[`${entity}ViewMode`]
          ),
        })),
      setViewMode: (
        entity: keyof typeof viewModes,
        viewMode: ReleaseListViewMode | ArtistsViewMode
      ) =>
        set({
          [`${entity}ViewMode`]: viewMode,
        }),
    }),
    {
      name: "playa-storage",
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ releaseListViewMode, artistsViewMode, path }) => ({
        releaseListViewMode,
        artistsViewMode,
        path,
      }),
    }
  )
);

export default useStore;
