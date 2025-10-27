import { useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Release } from "@/types/types";
import { getCover } from "@/lib/links";
import api from "../api";
import PlaybackButton from "./PlaybackButton";

import cx from "clsx";
import styles from "./Cover.module.css";

import { EMPTY_IMG } from "@/constants";

type CoverProps = Pick<Release, "id" | "title" | "hash"> & {
  path?: string;
  className?: string;
  playButtonClassName?: string;
  droppable?: boolean;
  dragOutside?: boolean;
  onContextMenu?: () => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
  onPlaybackClick?: () => void;
};

async function getDropURL(event: DragEvent): Promise<string | null> {
  return new Promise<string>((resolve, reject) => {
    try {
      event.dataTransfer.items[0].getAsString((url) =>
        url.startsWith("http") ? resolve(url) : reject(null)
      );
    } catch (error) {
      console.log("getDropUrl", error);
      reject(null);
    }
  });
}

export default function Cover({
  id,
  title,
  hash,
  path,
  className,
  playButtonClassName,
  onContextMenu,
  onClick,
  onDoubleClick,
  onLoad,
  onError,
  onPlaybackClick,
  droppable = true,
  dragOutside = true,
}: CoverProps) {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  async function onDrop(event: DragEvent) {
    event.preventDefault();
    const url = await getDropURL(event);
    if (!url) {
      return;
    }
    const didUpdate = await api.release.downloadCover({ id, url });
    if (!didUpdate) {
      return;
    }
    setError(false);
  }

  const src = !error ? getCover(hash) : EMPTY_IMG;

  return (
    <div
      onDrop={droppable ? onDrop : null}
      onDragOver={(event) => event.preventDefault()}
      className={cx(styles.coverWrapper, className)}
      title={`${title} [${id}]`}
      onContextMenu={onContextMenu}
    >
      <img
        onDoubleClick={onDoubleClick}
        onClick={onClick}
        data-id={id}
        className={cx(styles.cover, { [styles.loaded]: loaded })}
        src={src}
        alt={t("components.Cover.altText", { title })}
        loading="lazy"
        onError={() => {
          setError(true);
          if (onError) {
            onError();
          }
        }}
        onLoad={(event) => {
          if ((event.target as HTMLImageElement).src === EMPTY_IMG) {
            return;
          }
          setLoaded(true);
          setError(false);
          if (onLoad) {
            onLoad();
          }
        }}
        onDragStart={
          dragOutside
            ? (event: DragEvent) => {
                event.preventDefault();
                if (!path) {
                  return;
                }
                api.system.startDrag(id);
              }
            : null
        }
      />
      {onPlaybackClick && (
        <PlaybackButton
          className={cx(styles.playbackButton, playButtonClassName)}
          onClick={onPlaybackClick}
        />
      )}
    </div>
  );
}
