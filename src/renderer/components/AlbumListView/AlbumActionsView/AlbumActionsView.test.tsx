import React from 'react';
import { render, mount } from 'enzyme';
import { albums } from '../../../../../test/testFixtures';
import { AlbumActionsView, ActionsConfig } from './AlbumActionsView';

describe('AlbumActionsView', () => {

  const actions = [
    {
      icon: 'play',
      handler: jest.fn(),
      title: 'play'
    },
    {
      icon: 'search',
      handler: jest.fn(),
      title: 'search'
    },
  ] as ActionsConfig[];

  it('should render a .album-actions', () => {
    const wrapper = render(
      <AlbumActionsView
        album={albums[0]}
        actions={actions}/>
      );
    expect(wrapper.is('.album-actions')).toBe(true);
  });

  it('should render n=actions.length buttons', () => {
    const wrapper = render(
      <AlbumActionsView
        album={albums[0]}
        actions={actions}/>
      );
    expect(wrapper.find('.album-actions-button')).toHaveLength(actions.length);
  });

  it('should call the action event handler when the corresponding button is clicked', () => {
    const wrapper = mount(
      <AlbumActionsView
        album={albums[0]}
        actions={actions}/>
      );
    wrapper.find('.album-actions-button').forEach((button, index) => {
      button.simulate('click');
      expect(actions[index].handler).toHaveBeenCalledWith(albums[0]);
    })
  });
});
