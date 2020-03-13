import React from 'react';
import { renderInAll } from '../../../../../../test/testUtils';
import { QueueButton } from './QueueButton';

describe('QueueButton', () => {
  it('should render a .button-queue', () => {
    const wrapper = renderInAll(<QueueButton onDrop={jest.fn()}/>);
    expect(wrapper.find('.button-queue')).toHaveLength(1);
  });

  it('should have className class', () => {
    const wrapper = renderInAll(<QueueButton className="someClass" onDrop={jest.fn()}/>);
    expect(wrapper.find('.button-queue').is('.someClass')).toBe(true);
  });
});
