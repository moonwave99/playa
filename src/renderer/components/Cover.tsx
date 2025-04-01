import { useState } from "react";
import type { DragEvent } from "react";
import cx from "clsx";
import { getCover } from "@/lib/links";
import styles from "./Cover.module.css";

type CoverProps = {
    id: number;
    title: string;
    hash: string;
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
    onContextMenu,
    onDoubleClick,
    onLoad,
    onError,
    droppable = true,
    dragOutside = false,
}: CoverProps) {
    const [loadCount, setLoadCount] = useState(0);
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
        setLoadCount((prev) => prev + 1);
    }

    const src = !error ? getCover(hash) : null;

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
                key={loadCount}
                data-id={id}
                className={cx(styles.cover, { [styles.loaded]: loaded })}
                src={src}
                loading="lazy"
                onError={() => {
                    setError(true);
                    onError && onError();
                }}
                onLoad={() => {
                    setLoaded(true);
                    setError(false);
                    onLoad && onLoad();
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
