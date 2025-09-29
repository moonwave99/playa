import { useRef } from "react";
import type { FormEvent, Ref } from "react";
import api from "../api";
import { useKeyManager, withMeta } from "@/renderer/hooks/useKeyboardManager";

type UseSearchInputParams = {
  setQuery: (query: string) => void;
  resultTypes: string[];
};

type UseSearchInput = Pick<
  ReturnType<typeof useKeyManager>,
  "currentContext" | "setContext"
> & {
  inputRef: Ref<HTMLInputElement>;
  inputHandlers: {
    onInput: (event: FormEvent) => void;
    onBlur: () => void;
    onFocus: () => void;
  };
  listHandlers: {
    onUp: () => void;
  };
};

export default function useSearchInput({
  setQuery,
  resultTypes,
}: UseSearchInputParams): UseSearchInput {
  const inputRef = useRef<HTMLInputElement>(null);

  const { setContext, currentContext } = useKeyManager({
    context: "modal",
    handlers: {
      f: withMeta(() => inputRef.current?.focus()),
      ArrowDown: () => {
        if (
          currentContext.startsWith("modal:search:results") &&
          resultTypes.length > 1
        ) {
          return;
        }
        setContext("modal:search:results(0)");
      },
    },
  });

  function onInput(event: FormEvent) {
    setQuery((event.target as HTMLInputElement).value);
  }

  function onBlur() {
    api.state.setInputFocused(false);
  }

  function onFocus() {
    setContext("modal:search:input");
    api.state.setInputFocused(true);
  }

  function onUp() {
    inputRef.current?.focus();
  }

  return {
    inputRef,
    currentContext,
    setContext,
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
