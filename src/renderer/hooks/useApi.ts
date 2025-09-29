import { useEffect } from "react";
import api from "../api";

type Callback = (...args: unknown[]) => void;

export function useApi<K extends keyof typeof api>(
  params: Record<K, Callback>
) {
  useEffect(() => {
    const unsubscribe: (() => void)[] = [];

    Object.entries(params).forEach(([methodName, callback]: [K, Callback]) => {
      const method = api[methodName];
      if (typeof method !== "function") {
        return;
      }
      unsubscribe.push(
        (api[methodName] as unknown as (callback: Callback) => () => void)(
          callback
        )
      );
    });

    return () => {
      unsubscribe.forEach((u) => u());
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

export function useOnExportData(callback: (status: string) => void) {
  useEffect(() => {
    const unsubscribe = api.importExport.onExportData(callback);
    return () => {
      unsubscribe();
    };
  }, []);
}
