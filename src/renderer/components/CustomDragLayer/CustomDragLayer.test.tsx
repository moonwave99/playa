import React from 'react';
import { renderInAll } from '../../../../test/testUtils';

class Monitor {
  public params: object;
  constructor() {
    this.params = {};
  }
  setParams(params: object): void {
    this.params = params;
  }
}

const monitor = new Monitor();

jest.mock('react-dnd', () => ({
  ...jest.requireActual('react-dnd'),
  useDragLayer: (): object => monitor.params
}));

import { CustomDragLayer } from './CustomDragLayer';
import { UIDragTypes } from '../../store/modules/ui';

describe('CustomDragLayer', () => {
  it('should render nothing if user is not dragging', () => {
    const wrapper = renderInAll(
      <CustomDragLayer/>
    );
    expect(wrapper.find('.custom-drag-layer')).toHaveLength(0);
  });

  it('should render a drag preview if isDragging and itemType is permitted', () => {
    monitor.setParams({
      item: {
        selection: ['1']
      },
      isDragging: true,
      itemType: UIDragTypes.LIBRARY_ALBUMS
    });
    const wrapper = renderInAll(
      <CustomDragLayer/>
    );
    expect(wrapper.is('.custom-drag-layer')).toBe(true);
    monitor.setParams({});
    jest.unmock('react-dnd');
  });

  it('should render a count badge is item selection is multiple', () => {
    monitor.setParams({
      item: {
        selection: ['1', '2']
      },
      isDragging: true,
      itemType: UIDragTypes.LIBRARY_ALBUMS
    });
    const wrapper = renderInAll(
      <CustomDragLayer/>
    );
    expect(+wrapper.find('.count-badge').text()).toBe(2);
    monitor.setParams({});
    jest.unmock('react-dnd');
  });

  it('should have the proper styles', () => {
    monitor.setParams({
      item: {
        selection: ['1', '2']
      },
      isDragging: true,
      itemType: UIDragTypes.LIBRARY_ALBUMS,
      initialClientOffset: { x: 0, y: 0},
      initialSourceClientOffset: { x: 0, y: 0},
      currentOffset: { x: 0, y: 0}
    });
    const wrapper = renderInAll(
      <CustomDragLayer/>
    );
    expect(wrapper.is('.custom-drag-layer')).toBe(true);
    monitor.setParams({});
    jest.unmock('react-dnd');
  });
});
