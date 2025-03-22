import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ViewMode } from '@/types/types';


type Store = {
  viewMode: ViewMode;
  path: string;
  toggleViewMode: () => void;
  setPath: (path: string) => void;
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      path: '/',
      toggleViewMode: () => set((prev) => ({ viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' })),
      setPath: (path: string) => set(({ path }))
    }),
    {
      name: 'playa-storage',
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ viewMode, path }) => ({ viewMode, path }),
    }
  )
);

export default useStore;