import { useEffect, useRef } from "react";
import type { FormEvent, Ref } from "react";
import api from "../api";
import {
  useKeyManager,
  KeyManager,
  withMeta,
} from "@/renderer/hooks/useKeyboardManager";

type UseSidebarParams = {
  isPending: boolean;
  setQuery: (query: string) => void;
};

type UseSidebar = {
  inputRef: Ref<HTMLInputElement>;
  currentContext: string;
  inputHandlers: {
    onInput: (event: FormEvent) => void;
    onBlur: () => void;
    onFocus: () => void;
  };
  listHandlers: {
    onUp: () => void;
  };
};

export default function useSidebar({
  isPending,
  setQuery,
}: UseSidebarParams): UseSidebar {
  const firstRender = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setContext, currentContext } = useKeyManager({
    context: KeyManager.global,
    handlers: {
      f: withMeta(() => inputRef.current?.focus()),
    },
  });

  useKeyManager({
    context: "sidebar:input",
    handlers: {
      "\\": withMeta(() => {
        api.state.toggleSidebar(false);
        setContext("list");
      }),
      ArrowRight: withMeta(() => {
        inputRef.current.selectionStart = 0;
        inputRef.current.selectionEnd = 0;
      }),
      ArrowLeft: (event: KeyboardEvent) => {
        if (event.metaKey) {
          inputRef.current.selectionStart = inputRef.current?.value.length;
          inputRef.current.selectionEnd = inputRef.current?.value.length;
          return;
        }
        if (inputRef.current?.selectionEnd !== inputRef.current?.value.length) {
          return;
        }
        inputRef.current?.blur();
        queueMicrotask(() => setContext("list"));
      },
      Escape: () => {
        inputRef.current?.blur();
        queueMicrotask(() => setContext("list"));
      },
    },
  });

  useEffect(() => {
    if (
      isPending ||
      (!currentContext.startsWith("sidebar") && !firstRender.current)
    ) {
      return;
    }
    inputRef.current?.focus();
    firstRender.current = false;
  }, [currentContext, isPending]);

  function onInput(event: FormEvent) {
    setQuery((event.target as HTMLInputElement).value);
  }

  function onBlur() {
    api.state.setInputFocused(false);
  }

  function onFocus() {
    setContext("sidebar:input");
    api.state.setInputFocused(true);
  }

  function onUp() {
    inputRef.current?.focus();
  }

  return {
    inputRef,
    currentContext,
    inputHandlers: {
      onInput,
      onBlur,
      onFocus,
    },
    listHandlers: {
      onUp,
    },
  };
}
