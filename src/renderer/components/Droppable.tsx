import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Collection, Group, EntityType } from "@/types/types";
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

const configMap: Record<
  EntityType,
  {
    id: EntityType;
    accepts: EntityType[];
  }
> = {
  Collection: {
    id: "Collection",
    accepts: ["Release"],
  },
  Group: {
    id: "Group",
    accepts: ["Artist"],
  },
  Artist: {
    id: "Artist",
    accepts: [],
  },
  Track: {
    id: "Track",
    accepts: [],
  },
  Release: {
    id: "Release",
    accepts: [],
  },
};

export default function Droppable({
  className,
  render,
  item,
  children,
}: DroppableProps) {
  const { id, accepts } = configMap[item.entityType];
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
      accepts.includes(active.data.current.entityType));

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
