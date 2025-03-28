import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ViewMode } from '@/types/types';

export type ModalContents = { name: string; params?: Record<string, string | number> };

type Store = {
  viewMode: ViewMode;
  showSidebar: boolean;
  path: string;
  modalContents: ModalContents | null;
  toggleViewMode: () => void;
  toggleSidebar: () => void;
  setPath: (path: string) => void;
  setModalContents: (modalContents: ModalContents) => void;
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      path: '/',
      showSidebar: false,
      modalContents: null,
      toggleSidebar: () => set((prev) => ({ showSidebar: !prev.showSidebar })),
      toggleViewMode: () => set((prev) => ({ viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' })),
      setPath: (path: string) => set(({ path })),
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