import React from 'react';
import { renderInAll } from '../../../../../test/testUtils';

import { CustomDragLayer } from './CustomDragLayer';

describe('CustomDragLayer', () => {
  it('should render nothing if user is not dragging', () => {
    const wrapper = renderInAll(
      <CustomDragLayer/>
    );
    expect(wrapper.find('.custom-drag-layer')).toHaveLength(0);
  });
});
