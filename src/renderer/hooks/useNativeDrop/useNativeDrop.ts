import { useDrop, DragObjectWithType, DragElementWrapper } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
export { NativeTypes } from 'react-dnd-html5-backend';

export interface NativeDragItem extends DragObjectWithType {
  urls?: string[];
  files?: File[];
}

type UseNativeDropParams = {
  onDrop: Function;
  accept?: string[];
  filter?: Function;
}

export default function useNativeDrop<T>({
  onDrop,
  accept = [NativeTypes.FILE, NativeTypes.URL],
  filter
}: UseNativeDropParams): {
  isOver: boolean;
  canDrop: boolean;
  drop: DragElementWrapper<T>;
} {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: (item: NativeDragItem) => {
      let url = '';
      if (item.urls) {
        url = item.urls[0];
      }
      if (item.files) {
        if (filter && !filter(item.files[0].type)) {
          return;
        }
        url = item.files[0].path;
      }
      onDrop(url);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    })
  });
  return { isOver, canDrop, drop };
}
