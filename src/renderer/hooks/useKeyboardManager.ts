import type { PropsWithChildren, } from 'react';
import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

import { throttle } from 'lodash';

export const KeyManagerContext = createContext<{
  register: (context: string, handlers: KeyHandlers) => void;
  unregister: (context: string) => void;
  setContext: (context: string) => void;
  toggleGlobal: (toggle?: boolean) => void;
  currentContext: string;
}>({
  register: () => void (0),
  unregister: () => void (0),
  setContext: () => void (0),
  toggleGlobal: () => void (0),
  currentContext: ''
});

type UseKeyManagerParams = Partial<{
  context: string;
  handlers: KeyHandlers;
}>;

type UseKeyManager = {
  setContext: (context: string) => void;
  toggleGlobal: (toggle: boolean) => void;
  currentContext: string;
};

export function useKeyManager(params?: UseKeyManagerParams): UseKeyManager {
  const { register, unregister, setContext, toggleGlobal, currentContext } = useContext(KeyManagerContext);
  const {
    context,
    handlers,
  } = params || {};
  useEffect(() => {
    if (context && handlers) {
      register(context, handlers);
    }
    return () => unregister(context);
  }, [context, handlers]);
  return { setContext, toggleGlobal, currentContext };
}

export function KeyManagerProvider(props: PropsWithChildren) {
  const keyManagerRef = useRef<KeyManager>(null);
  const [context, setContext] = useState(null);

  useEffect(() => {
    keyManagerRef.current?.setContext(context);
  }, [context]);

  if (!keyManagerRef.current) {
    keyManagerRef.current = new KeyManager();
  }

  function register(context: string, handlers: KeyHandlers) {
    keyManagerRef.current?.register(context, handlers);
  }

  function unregister(context: string) {
    keyManagerRef.current?.unregister(context);
  }

  function toggleGlobal(toggle?: boolean) {
    keyManagerRef.current?.toggleGlobal(toggle);
  }

  useEffect(() => {
    const onKeyDown = throttle((event: KeyboardEvent) => {
      keyManagerRef.current?.keydown(event);
    }, 50);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return createElement(KeyManagerContext.Provider, {
    ...props,
    value: {
      currentContext: context,
      register,
      unregister,
      setContext,
      toggleGlobal,
    },
  });
}

type KeyHandler = (event: KeyboardEvent, ...params: unknown[]) => void;

type KeyHandlers = Record<string, KeyHandler>;

export function withMeta(handler: KeyHandler): KeyHandler {
  return (event: KeyboardEvent) => {
    if (!event.metaKey) {
      return;
    }
    handler(event);
  };
}

export function withPrevent(handler: KeyHandler): KeyHandler {
  return (event: KeyboardEvent, ...params: unknown[]) => {
    event.preventDefault();
    handler(event, ...params);
  };
}

export class KeyManager {
  static global = '__global__';
  private handlers: Record<string, KeyHandlers>;
  private currentContext: string;
  private enableGlobal: boolean;
  constructor() {
    this.handlers = {};
    this.currentContext = '';
    this.enableGlobal = true;
  }
  keydown(event: KeyboardEvent) {
    Object.entries(this.handlers).forEach(([key, handlers]) => {
      if (doContextsMatch(key, this.currentContext)) {
        const handler = handlers?.[event.key];
        if (!handler) {
          return;
        }
        handler(event);
      }
    })
    if (!this.enableGlobal) {
      return;
    }
    const globalHandler = this.handlers[KeyManager.global]?.[event.key];
    if (globalHandler) {
      globalHandler(event);
    }
  }
  register(context: string, handlers: KeyHandlers) {
    if (context === KeyManager.global) {
      this.handlers[context] = {
        ...this.handlers[context],
        ...handlers
      };
      return;
    }
    this.handlers[context] = handlers;
  }
  unregister(context: string) {
    delete this.handlers[context];
  }
  setContext(context: string) {
    this.currentContext = context;
  }
  toggleGlobal(toggle?: boolean) {
    this.enableGlobal = toggle !== undefined ? toggle : !this.enableGlobal;
  }
}

export function doContextsMatch(a: string, b: string) {
  return a.split(':').at(0) === b.split(':').at(0);
}