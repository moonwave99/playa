import { useEffect, useRef } from "react";
import type {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  Ref
} from "react";

import {
  useKeyManager,
  KeyManager,
  withMeta,
} from "@/renderer/hooks/useKeyboardManager";


type UseSidebarParams = {
  isPending: boolean;
  query: string;
  setQuery: (query: string) => void;
};

type UseSidebar = {
  inputRef: Ref<HTMLInputElement>,
  currentContext: string;
  inputHandlers: {
    onKeyDown: (event: ReactKeyboardEvent) => void;
    onInput: (event: FormEvent) => void;
    onBlur: () => void;
    onFocus: () => void;
  },
  listHandlers: {
    onUp: () => void;
    onRight: () => void;
  }
}

export default function useSidebar({ isPending, query, setQuery }: UseSidebarParams): UseSidebar {
  const firstRender = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setContext, currentContext } = useKeyManager({
    context: KeyManager.global,
    handlers: {
      f: withMeta(() => inputRef.current?.focus()),
    },
  });

  useEffect(() => {
    if (
      isPending ||
      (currentContext !== "sidebar" && !firstRender.current)
    ) {
      return;
    }
    inputRef.current?.focus();
    firstRender.current = false;
  }, [currentContext, isPending]);

  function onKeyDown(event: ReactKeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== 'Escape') {
      return;
    }
    if (event.key !== "ArrowRight" && inputRef.current.selectionEnd !== query.length) {
      return;
    }
    setTimeout(() => setContext("list"), 0);
    inputRef.current?.blur();
  }

  function onInput(event: FormEvent) {
    setQuery((event.target as HTMLInputElement).value);
  }

  function onBlur() {
    window.api.ui.inputBlur();
  }

  function onFocus() {
    setContext("sidebar");
    window.api.ui.inputFocus();
  }

  function onUp() {
    inputRef.current?.focus();
  }

  function onRight() {
    inputRef.current?.blur();
    setContext("list");
  }

  return {
    inputRef,
    currentContext,
    inputHandlers: {
      onKeyDown,
      onInput,
      onBlur,
      onFocus,
    },
    listHandlers: {
      onUp,
      onRight,
    }
  };
}