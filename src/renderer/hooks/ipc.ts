import { useEffect } from 'react';
import type { Sidebars } from "@/types/types";

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