import { useEffect, useRef } from "react";
import type { FormEvent, Ref } from "react";
import api from "../api";
import { useKeyManager, withMeta } from "@/renderer/hooks/useKeyboardManager";

type UseSearchInputParams = {
  setQuery: (query: string) => void;
  resultTypes: string[];
  onUp?: () => void;
  onInputChange?: (query: string) => void;
  baseContext?: string;
  shouldFocusInput?: boolean;
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
  onUp,
  onInputChange,
  baseContext = "modal",
  shouldFocusInput = true,
}: UseSearchInputParams): UseSearchInput {
  const inputRef = useRef<HTMLInputElement>(null);

  const { setContext, currentContext } = useKeyManager({
    context: baseContext,
    handlers: {
      f: withMeta(() => inputRef.current?.focus()),
      ArrowDown: () => {
        if (
          currentContext.startsWith(`${baseContext}:search:results`) &&
          resultTypes.length > 1
        ) {
          return;
        }
        setContext(`${baseContext}:search:results(0)`);
      },
    },
  });

  useEffect(() => {
    return () => {
      api.state.setInputFocused(false);
      setContext("list");
    };
  }, []);

  function onInput(event: FormEvent) {
    const value = (event.target as HTMLInputElement).value;
    setQuery(value);
    if (!onInputChange) {
      return;
    }
    onInputChange(value);
  }

  function onBlur() {
    if (!shouldFocusInput) {
      return;
    }
    api.state.setInputFocused(false);
  }

  function onFocus() {
    setContext(`${baseContext}:search:input`);
    if (!shouldFocusInput) {
      return;
    }
    api.state.setInputFocused(true);
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
      onUp: () => {
        inputRef.current?.focus();
        if (!onUp) {
          return;
        }
        onUp();
      },
    },
  };
}
