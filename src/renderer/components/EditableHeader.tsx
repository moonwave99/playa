import type { Collection, Group } from "@/types/types";
import { FormEvent, useEffect, useRef, useState } from "react";
import api from "../api";
import { useKeyManager } from "../hooks/useKeyboardManager";
import styles from "../pages/Page.module.css";

type Item = Group | Collection;

type HeaderProps = {
  item: Item;
  onTitleUpdate: (title: string) => void;
  isFocused?: boolean;
  blurContext?: string;
  onContextMenu?: () => void;
};

export default function EditableHeader({
  item,
  onTitleUpdate,
  isFocused,
  blurContext = "list",
  onContextMenu,
}: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(item.title);
  const [isEditing, setEditing] = useState(isFocused);

  const context = `${item.entityType.toLowerCase()}:input`;

  const { setContext } = useKeyManager({
    context,
    handlers: {
      Escape: () => setEditing(false),
      Enter: () => setTimeout(() => setEditing(true), 100),
    },
  });

  useEffect(() => {
    if (isEditing) {
      setContext(context);
      inputRef.current?.focus();
      return;
    }
    api.state.setInputFocused(false);
    setContext(blurContext);
  }, [isEditing]);

  function onTitleFocus() {
    setContext(context);
  }

  function onTitleBlur() {
    setContext(blurContext);
  }

  if (!isEditing) {
    return (
      <h1
        onClick={() => setEditing(true)}
        className={styles.header}
        onContextMenu={onContextMenu}
      >
        <span tabIndex={0} onFocus={onTitleFocus} onBlur={onTitleBlur}>
          {title}
        </span>
      </h1>
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTimeout(() => setEditing(false), 100);
    onTitleUpdate(title);
  }

  return (
    <form onSubmit={onSubmit} className={styles.headerForm}>
      <input
        ref={inputRef}
        className={styles.headerInput}
        value={title}
        onInput={(event: FormEvent<HTMLInputElement>) =>
          setTitle((event.target as HTMLInputElement).value)
        }
        onBlur={() => {
          setEditing(false);
          if (title.trim() === "") {
            setTitle(item.title);
            return;
          }
          onTitleUpdate(title);
          api.state.setInputFocused(false);
        }}
        onFocus={(event: FormEvent<HTMLInputElement>) => {
          (event.target as HTMLInputElement).select();
          api.state.setInputFocused(true);
        }}
        required
      />
    </form>
  );
}
