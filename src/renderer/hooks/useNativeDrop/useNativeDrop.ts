import { useDrop, DragObjectWithType, DragElementWrapper } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
export { NativeTypes } from 'react-dnd-html5-backend';

export interface NativeDragItem extends DragObjectWithType {
  urls?: string[];
  files?: File[];
}

export function getURLfromItem(
  item: NativeDragItem,
  filter: Function = (): boolean => true
) {
  let url = null;
  if (item.urls) {
    url = item.urls[0];
  }
  if (item.files) {
    if (!filter(item.files[0].type)) {
      return null;
    }
    url = item.files[0].path;
  }
  return url;
}

type UseNativeDropParams = {
  onDrop: Function;
  accept?: string[];
  filter?: Function;
}

export default function useNativeDrop<T>({
  onDrop,
  accept = [NativeTypes.FILE, NativeTypes.URL],
  filter = (): boolean => true
}: UseNativeDropParams): {
  isOver: boolean;
  canDrop: boolean;
  drop: DragElementWrapper<T>;
} {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: (item: NativeDragItem) => onDrop(getURLfromItem(item, filter)),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });
  return { isOver, canDrop, drop };
}
