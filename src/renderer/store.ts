import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ViewMode } from '@/types/types';

type Store = {
  viewMode: ViewMode;
  path: string;
  modalContents: string | null;
  toggleViewMode: () => void;
  setPath: (path: string) => void;
  setModalContents: (modalContents: string | null) => void;
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      path: '/',
      modalContents: null,
      toggleViewMode: () => set((prev) => ({ viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' })),
      setPath: (path: string) => set(({ path })),
      setModalContents: (modalContents: string | null) => set(({ modalContents }))
    }),
    {
      name: 'playa-storage',
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ viewMode, path }) => ({ viewMode, path }),
    }
  )
);

export default useStore;