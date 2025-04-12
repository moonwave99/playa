import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Collection, Group } from "@/types/types";
import cx from "clsx";
import styles from "../dnd.module.css";

export type DroppableRender = ({
    isOver,
    canDrop,
}: {
    isOver: boolean;
    canDrop: boolean;
}) => ReactNode;

type DroppableProps = {
    item: Collection | Group;
    children?: ReactNode;
    className?: string;
    render?: DroppableRender;
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
    render,
    item,
    children,
}: DroppableProps) {
    const { id, accepts } = configMap[item._type];
    const { setNodeRef, isOver, active } = useDroppable({
        id: `${id}-${item.id}`,
        data: {
            ...item,
            accepts,
        },
    });

    const canDrop =
        isOver &&
        (accepts.includes(active.data.current.type) ||
            accepts.includes(active.data.current._type));

    return (
        <div
            ref={setNodeRef}
            className={cx(styles.Droppable, className, {
                [styles.isOver]: isOver,
                [styles.canDrop]: canDrop,
            })}
        >
            {render ? render({ isOver, canDrop }) : children}
        </div>
    );
}
