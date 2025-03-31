import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ViewMode } from '@/types/types';

export type ModalContents = { name: string; params?: Record<string, unknown> };

type Store = {
  viewMode: ViewMode;
  showSidebar: boolean;
  useDarkText: boolean;
  path: string;
  modalContents: ModalContents | null;
  toggleViewMode: () => void;
  toggleSidebar: (showSidebar?: boolean) => void;
  setUseDarkText: (useDarkText: boolean) => void;
  setPath: (path: string) => void;
  setModalContents: (modalContents: ModalContents) => void;
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      path: '/',
      showSidebar: false,
      useDarkText: false,
      modalContents: null as ModalContents,
      toggleSidebar: (showSidebar?: boolean) => set(
        (prev) => ({ showSidebar: showSidebar === undefined ? !prev.showSidebar : showSidebar })
      ),
      toggleViewMode: () => set((prev) => ({ viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' })),
      setUseDarkText: (useDarkText) => set(({ useDarkText })),
      setPath: (path) => set(({ path })),
      setModalContents: (modalContents) => set(({ modalContents }))
    }),
    {
      name: 'playa-storage',
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ viewMode, path }) => ({ viewMode, path }),
    }
  )
);

export default useStore;