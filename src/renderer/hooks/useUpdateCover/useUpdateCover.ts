import { useDispatch } from 'react-redux';
import {useDrop, DragObjectWithType, DragElementWrapper } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import { Album } from '../../store/modules/album';
import { getCoverFromUrlRequest } from '../../store/modules/cover';

interface DragItem extends DragObjectWithType{
  urls?: string[];
  files?: File[];
}

export default function useUpdateCover<T>(album: Album): {
  isOver: boolean;
  canDrop: boolean;
  drop: DragElementWrapper<T>;
} {
  const dispatch = useDispatch();
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [NativeTypes.FILE, NativeTypes.URL],
    drop: (item: DragItem) => {
      let url = '';
      if (item.urls) {
        url = item.urls[0];
      }
      if (item.files) {
        url = item.files[0].path;
      }
      dispatch(getCoverFromUrlRequest(album, url));
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    })
  });
  return { isOver, canDrop, drop };
}
