import { useRef, Ref } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord, TargetType, Identifier } from 'dnd-core';

interface DragItem {
  index: number;
  _id: string;
  type: string;
}

type UseReorderParams = {
  index: number;
  _id: string;
  sortable: boolean;
  accept: TargetType;
  type: Identifier;
  onMove: Function;
  onDragEnd?: Function;
}

export default function useReorder({
  index,
  _id,
  sortable,
  accept,
  type,
  onMove,
  onDragEnd
}: UseReorderParams): {
  isOver: boolean;
  canDrop: boolean;
  isDragging: boolean;
  ref: Ref<HTMLElement>;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      const draggingDownwards = dragIndex < hoverIndex && hoverClientY < hoverMiddleY;
      const draggingUpwards = dragIndex > hoverIndex && hoverClientY > hoverMiddleY;
      if (draggingDownwards || draggingUpwards) {
        return;
      }
      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag] = useDrag({
    item: { type, _id, index },
    isDragging: (monitor) => _id === monitor.getItem()._id,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, monitor) => {
      if (monitor.didDrop()) {
        onDragEnd();
      }
    }
  });
  if (sortable) {
    drag(drop(ref));
  }
  return {
    isOver,
    canDrop,
    isDragging,
    ref
  };
}
