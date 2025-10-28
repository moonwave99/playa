import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  listViewModesMap,
  ListViewModes,
  ReleaseListViewMode,
  ArtistListViewMode,
  CollectionListViewMode,
  GroupListViewMode,
  ListViews,
  Settings,
} from "@/types/types";
import { Modals } from "./Modal";

export type ModalContents = { name: Modals; params?: Record<string, unknown> };

function getNextListViewMode<T>(entity: ListViews, current: T) {
  const currentIndex = (listViewModesMap[entity] as T[]).indexOf(current);
  return listViewModesMap[entity][
    (currentIndex + 1) % listViewModesMap[entity].length
  ] as T;
}

type Store = {
  listViewModes: {
    release: ReleaseListViewMode;
    artist: ArtistListViewMode;
    collection: CollectionListViewMode;
    group: GroupListViewMode;
  };
  useDarkText: boolean;
  path: string;
  modalContents: ModalContents | null;
  isModalFixed: boolean;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  toggleListViewMode: (list: ListViews) => void;
  setListViewMode: (list: ListViews, listViewMode: ListViewModes) => void;
  isListViewMode: (list: ListViews, listViewMode: ListViewModes) => boolean;
  getListViewMode: <K extends ListViews>(
    entity: K
  ) => (typeof listViewModesMap)[K][0];
  setUseDarkText: (useDarkText: boolean) => void;
  setPath: (path: string) => void;
  setModalContents: (modalContents: ModalContents) => void;
  setModalFixed: (isModalFixed: boolean) => void;
};

const useStore = create<Store>()(
  persist(
    (set, get) => ({
      listViewModes: {
        release: "grid",
        artist: "latest",
        collection: "latest",
        group: "latest",
      },
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
      toggleListViewMode: (list) =>
        set(({ listViewModes }) => ({
          listViewModes: {
            ...listViewModes,
            [list]: getNextListViewMode(list, listViewModes[list]),
          },
        })),
      setListViewMode: (list, listViewMode) =>
        set(({ listViewModes }) => ({
          listViewModes: {
            ...listViewModes,
            [list]: listViewMode,
          },
        })),
      isListViewMode: (list, listViewMode) =>
        get().listViewModes[list] === listViewMode,
      getListViewMode: (list) => get().listViewModes[list],
    }),
    {
      name: "playa-storage",
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ listViewModes, path }) => ({
        listViewModes,
        path,
      }),
    }
  )
);

export default useStore;
