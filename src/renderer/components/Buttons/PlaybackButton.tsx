import { type ButtonHTMLAttributes } from "react";
import { Icon } from "@/renderer/icons";
import cx from "clsx";
import styles from "./PlaybackButton.module.css";

type PlaybackButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function PlaybackButton(props: PlaybackButtonProps) {
  return (
    <button
      {...props}
      type="button"
      className={cx(styles.button, props.className)}
    >
      <Icon isFor="actions.play" />
    </button>
  );
}
