import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ViewMode, Settings } from "@/types/types";

export type ModalContents = { name: string; params?: Record<string, unknown> };

const viewModes = ["grid", "list", "compact"] as ViewMode[];

function getNextViewMode(current: ViewMode): ViewMode {
  const currentIndex = viewModes.indexOf(current);
  return viewModes[(currentIndex + 1) % viewModes.length];
}

type Store = {
  viewMode: ViewMode;
  useDarkText: boolean;
  path: string;
  modalContents: ModalContents | null;
  isModalFixed: boolean;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  toggleViewMode: () => void;
  setUseDarkText: (useDarkText: boolean) => void;
  setPath: (path: string) => void;
  setModalContents: (modalContents: ModalContents) => void;
  setModalFixed: (isModalFixed: boolean) => void;
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      viewMode: "grid",
      path: "/",
      useDarkText: false,
      modalContents: null as ModalContents,
      isModalFixed: false,
      settings: null as Settings,
      setSettings: (settings) => set({ settings }),
      toggleViewMode: () =>
        set(({ viewMode }) => ({ viewMode: getNextViewMode(viewMode) })),
      setUseDarkText: (useDarkText) => set({ useDarkText }),
      setPath: (path) => set({ path }),
      setModalContents: (modalContents) => set({ modalContents }),
      setModalFixed: (isModalFixed) => set({ isModalFixed }),
    }),
    {
      name: "playa-storage",
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ viewMode, path }) => ({ viewMode, path }),
    }
  )
);

export default useStore;
