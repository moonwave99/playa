import { ipcRenderer as ipc } from "electron";
import type { IpcRendererEvent } from "electron";

export type Callback = (...args: unknown[]) => void;
export type AsyncCallback = (...args: unknown[]) => Promise<void>;
export type CallbackWithUnsubscribe = (...args: unknown[]) => () => void;

export function getHandlers(entity: Record<string, Callback>) {
  return Object.entries(entity).reduce(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (memo, [name, handler]) => {
      return {
        ...memo,
        [name]: (...params: Parameters<typeof handler>) =>
          ipc.invoke(name, ...params),
      };
    },
    {} as Record<keyof typeof entity, AsyncCallback>
  );
}

export function getEventHandler(name: string): CallbackWithUnsubscribe {
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

export function getHandlersFromActions(actionNames: string[]) {
  return actionNames.reduce(
    (memo, name) => ({
      ...memo,
      [name]: (...params: unknown[]) => ipc.invoke(name as string, ...params),
    }),
    {}
  );
}

export function getEventHandlersFromActions(actionNames: string[]) {
  return actionNames.reduce(
    (memo, name) => ({
      ...memo,
      [name]: getEventHandler(name),
    }),
    {}
  );
}

function getEventName(prefixed: string) {
  const withoutPrefix = prefixed.replace(/^on/, "");
  return `${withoutPrefix.at(0).toLowerCase()}${withoutPrefix.slice(1)}`;
}
