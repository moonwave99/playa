import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Artist, Release, SearchResult } from "@/types/types";
import cx from "clsx";
import styles from "../dnd.module.css";
import { PiDotsThreeVerticalBold } from "react-icons/pi";

type DraggableProps = {
    item: Artist | Release | SearchResult;
    children?: ReactNode;
    className?: string;
};

export default function Draggable({
    className,
    item,
    children,
}: DraggableProps) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `${item._type}-${item.id}`,
        data: item,
    });

    return (
        <div
            className={cx(styles.Draggable, className)}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
        >
            {children || <PiDotsThreeVerticalBold />}
        </div>
    );
}
