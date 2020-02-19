import * as React from 'react';
import { render, mount } from 'enzyme';

import { VolumeControl } from './VolumeControl';

describe('VolumeControl', () => {
  it('should render a .volume-control', () => {
    const wrapper = render(
      <VolumeControl
        onVolumeChange={jest.fn()}/>
    );
    expect(wrapper.is('.volume-control')).toBe(true);
  });

  it('should handle a .volume-control', () => {
    const handler = jest.fn();
    const wrapper = mount(
      <VolumeControl
        onVolumeChange={handler}/>
    );
    const input = wrapper.find('input');
    const node = input.getDOMNode() as HTMLInputElement;
    node.value = '50';
    input.simulate('change');
    expect(handler).toHaveBeenCalledWith(0.5);
  });
});
