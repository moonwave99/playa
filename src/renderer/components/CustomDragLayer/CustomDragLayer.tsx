import React, { ReactElement } from 'react';
import { XYCoord, useDragLayer } from 'react-dnd';
import { UIDragTypes } from '../../store/modules/ui';

import './CustomDragLayer.scss';

const COVER_WIDTH = 50;

function getItemStyle(
  initialClientOffset: XYCoord | null,
  initialSourceClientOffset: XYCoord | null,
  currentOffset: XYCoord | null
): object {
  if (
    !initialClientOffset
    || !initialSourceClientOffset
    || !currentOffset
  ) {
    return {
      display: 'none'
    };
  }
  const { x, y } = currentOffset;
  const dragOffsetX = initialClientOffset.x - initialSourceClientOffset.x;
  const dragOffsetY = initialClientOffset.y - initialSourceClientOffset.y;
  return {
    transform: `translate(${x + dragOffsetX - COVER_WIDTH / 2}px, ${y + dragOffsetY - COVER_WIDTH / 2}px)`
  };
}

export const CustomDragLayer = (): ReactElement => {
  const {
    itemType,
    isDragging,
    item,
    initialSourceClientOffset,
    initialClientOffset,
    currentOffset,
  } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  function renderItem(): ReactElement {
    switch (itemType) {
      case UIDragTypes.LIBRARY_ALBUMS:
      case UIDragTypes.SEARCH_RESULTS:
        return (
          <div className="album-drag-preview">
            { item.selection.length > 1
              ? <span className="count-badge">{item.selection.length}</span>
              : null }
          </div>
        );
      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }

  const itemStyle = getItemStyle(
    initialClientOffset,
    initialSourceClientOffset,
    currentOffset
  );

	return (
    <div className="custom-drag-layer">
      <div style={itemStyle}>
        {renderItem()}
      </div>
    </div>
	);
}
