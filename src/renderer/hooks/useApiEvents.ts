import { useEffect } from "react";
import api from "../api";

type Callback = (...args: unknown[]) => void;

export function useApiEvents(params: Partial<typeof api.events>) {
  useEffect(() => {
    const unsubscribe: (() => void)[] = [];

    Object.entries(params).forEach(
      ([methodName, callback]: [keyof typeof api.events, Callback]) => {
        const method = api.events[methodName];
        if (typeof method !== "function") {
          return;
        }
        unsubscribe.push(
          (
            api.events[methodName] as unknown as (
              callback: Callback
            ) => () => void
          )(callback)
        );
      }
    );

    return () => {
      unsubscribe.forEach((u) => u());
    };
  }, []);
}
