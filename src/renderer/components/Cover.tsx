import type { DragEvent } from "react";
import cx from "clsx";
import { getCover } from "@/lib/links";
import styles from "./Cover.module.css";

type CoverProps = {
    id: number;
    title: string;
    hash: string;
    path: string;
    className?: string;
    onContextMenu?: () => void;
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
}: CoverProps) {
    async function onDrop(event: DragEvent) {
        event.preventDefault();
        const url = await getDropURL(event);
        if (!url) {
            return;
        }
        window.api.system.downloadCover({ id, url });
    }

    return (
        <div
            onDrop={onDrop}
            onDragOver={(event) => event.preventDefault()}
            className={cx(styles.coverWrapper, className)}
            title={`${title} [${id}]`}
            onContextMenu={onContextMenu}
        >
            <img
                className={styles.cover}
                src={getCover(hash)}
                loading="lazy"
                onError={(event) =>
                    ((event.target as HTMLImageElement).src = "")
                }
                onLoad={(event) =>
                    (event.target as HTMLElement).classList.add(styles.loaded)
                }
                onDragStart={(event: DragEvent) => {
                    event.preventDefault();
                    window.api.system.startDrag(path);
                }}
            />
        </div>
    );
}
