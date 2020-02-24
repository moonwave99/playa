import * as React from 'react';
import { renderInAll } from '../../../../../test/testUtils';
import { QueueButton } from './QueueButton';

describe('QueueButton', () => {
  it('should render a .button-queue', () => {
    const wrapper = renderInAll(<QueueButton onDrop={jest.fn()}/>);
    expect(wrapper.find('.button-queue')).toHaveLength(1);
  });
});
