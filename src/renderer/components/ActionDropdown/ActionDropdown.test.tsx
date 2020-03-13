import React from 'react';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { ActionDropdown } from './ActionDropdown';
import { render, mount } from '../../../../test/testUtils';

describe('ActionDropdown', () => {
  const actions = [
    {
      id: 'action-one-id',
      label: 'Action one',
      icon: 'action-one-icon' as IconName,
      handler: jest.fn()
    },
    {
      id: 'action-two-id',
      label: 'Action two',
      icon: 'action-two-icon' as IconName,
      handler: jest.fn()
    }
  ];
  it('should render an .action-dropdown', () => {
    const wrapper = render(<ActionDropdown actions={[]}/>);
    expect(wrapper.is('.action-dropdown')).toBe(true);
  });

  it('should contain an .action-dropdown-trigger', () => {
    const wrapper = render(<ActionDropdown actions={[]}/>);
    expect(wrapper.find('.action-dropdown-trigger')).toHaveLength(1);
  });

  it('should have the passed className', () => {
    const wrapper = render(<ActionDropdown actions={[]} className="yo"/>);
    expect(wrapper.is('.yo')).toBe(true);
  });

  it('should call the action handler when the action item is selected', () => {
    const wrapper = mount(<ActionDropdown actions={actions}/>);
    wrapper.find('button.action-dropdown-trigger').simulate('click');
    wrapper.find('.action-dropdown-item').at(0).simulate('click');
    expect(actions[0].handler).toHaveBeenCalled();
  })
});
