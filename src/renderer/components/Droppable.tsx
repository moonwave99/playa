import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Collection, Group } from "@/types/types";
import cx from "clsx";
import styles from "../dnd.module.css";

type DraggableProps = {
    item: Collection | Group;
    children: ReactNode;
    className?: string;
};

const configMap = {
    collection: {
        id: "collection",
        accepts: ["release"],
    },
    group: {
        id: "group",
        accepts: ["artist"],
    },
};

export default function Droppable({
    className,
    item,
    children,
}: DraggableProps) {
    const { id, accepts } = configMap[item._type];
    const { setNodeRef, isOver, active } = useDroppable({
        id: `${id}-${item.id}`,
        data: {
            ...item,
            accepts,
        },
    });

    function canDrop() {
        return (
            isOver &&
            (accepts.includes(active.data.current.type) ||
                accepts.includes(active.data.current._type))
        );
    }

    return (
        <div
            ref={setNodeRef}
            className={cx(styles.Droppable, className, {
                [styles.isOver]: canDrop(),
            })}
        >
            {children}
        </div>
    );
}
