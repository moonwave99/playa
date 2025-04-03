import { useState } from "react";
import type { DragEvent } from "react";
import cx from "clsx";
import { getCover } from "@/lib/links";
import styles from "./Cover.module.css";
import type { Release } from "@/types/types";

type CoverProps = Pick<Release, "id" | "title" | "hash"> & {
    path?: string;
    className?: string;
    droppable?: boolean;
    dragOutside?: boolean;
    onContextMenu?: () => void;
    onDoubleClick?: () => void;
    onLoad?: () => void;
    onError?: () => void;
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

const emptyImg =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export default function Cover({
    id,
    title,
    hash,
    path,
    className,
    onContextMenu,
    onDoubleClick,
    onLoad,
    onError,
    droppable = true,
    dragOutside = false,
}: CoverProps) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    async function onDrop(event: DragEvent) {
        event.preventDefault();
        const url = await getDropURL(event);
        if (!url) {
            return;
        }
        const didUpdate = await window.api.system.downloadCover({ id, url });
        if (!didUpdate) {
            return;
        }
        setError(false);
    }

    const src = !error ? getCover(hash) : emptyImg;

    return (
        <div
            onDrop={droppable ? onDrop : null}
            onDragOver={(event) => event.preventDefault()}
            className={cx(styles.coverWrapper, className)}
            title={`${title} [${id}]`}
            onContextMenu={onContextMenu}
            onDoubleClick={onDoubleClick}
        >
            <img
                data-id={id}
                className={cx(styles.cover, { [styles.loaded]: loaded })}
                src={src}
                alt={title}
                loading="lazy"
                onError={() => {
                    setError(true);
                    if (onError) {
                        onError();
                    }
                }}
                onLoad={(event) => {
                    if ((event.target as HTMLImageElement).src === emptyImg) {
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
                              window.api.system.startDrag(path);
                          }
                        : null
                }
            />
        </div>
    );
}
