import { ipcRenderer as ipc } from "electron";
import type { IpcRendererEvent } from "electron";

export type Callback = (...args: unknown[]) => void;
export type AsyncCallback = (...args: unknown[]) => Promise<void>;
export type CallbackWithUnsubscribe = (...args: unknown[]) => () => void;

export function getHandlersFromActions<T extends Record<string, Callback>>(
  actionNames: (keyof T)[]
): T {
  return actionNames.reduce(
    (memo, name) => ({
      ...memo,
      [name]: (...params: unknown[]) => ipc.invoke(name as string, ...params),
    }),
    {}
  ) as T;
}

export function getEventHandlersFromActions<T extends Record<string, Callback>>(
  actionNames: (keyof T)[]
): T {
  return actionNames.reduce(
    (memo, name) => ({
      ...memo,
      [name]: getEventHandler(name as string),
    }),
    {}
  ) as T;
}

function getEventHandler(name: string): CallbackWithUnsubscribe {
  return (handler: Callback) => {
    function withoutEvent(
      _: IpcRendererEvent,
      ...args: Parameters<typeof handler>
    ) {
      handler(...args);
    }
    const eventName = getEventName(name);
    ipc.on(eventName, withoutEvent);
    return () => {
      ipc.off(eventName, withoutEvent);
    };
  };
}

function getEventName(prefixed: string) {
  const withoutPrefix = prefixed.replace(/^on/, "");
  return `${withoutPrefix.at(0).toLowerCase()}${withoutPrefix.slice(1)}`;
}
