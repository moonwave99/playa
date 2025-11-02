import { type ButtonHTMLAttributes } from "react";
import { Icon } from "@/renderer/icons";
import cx from "clsx";
import styles from "./ContextMenuButton.module.css";

type ContextMenuButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function ContextMenuButton(props: ContextMenuButtonProps) {
  return (
    <button
      {...props}
      type="button"
      className={cx(styles.button, props.className)}
    >
      <Icon isFor="actions.contextMenu" />
    </button>
  );
}
