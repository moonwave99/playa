import * as React from 'react';
import { render, mount } from 'enzyme';

import { CoverView } from './CoverView';
import { albums } from '../../../../../../test/fixtures';

describe('CoverView tests', () => {
  it('should render a <figure> with a title attribute', () => {
    const wrapper = render(
      <CoverView src='path/to/image.jpg' album={albums[0]} />
    );
    expect(wrapper.attr('title')).toBeDefined();
    expect(wrapper.is('figure')).toBe(true);
  });

  it('should have an <img> with an alt attribute', () => {
    const wrapper = render(
      <CoverView src='path/to/image.jpg' album={albums[0]} />
    );
    const img = wrapper.find('img');
    expect(img).toHaveLength(1);
    expect(img.attr('alt')).toBeDefined();
  });

  it('should have an <img>.empty if src if empty', () => {
    const wrapper = render(
      <CoverView src='' album={albums[0]} />
    );
    expect(wrapper.find('img.empty')).toHaveLength(1);
  });

  it('should have the passed className', () => {
    const wrapper = render(
      <CoverView src='path/to/image.jpg' album={albums[0]} className="yo"/>
    );
    expect(wrapper.is('.yo')).toBe(true);
  });

  it('should call the onClick handler when clicked', () => {
    const handler = jest.fn();
    const wrapper = mount(
      <CoverView src='path/to/image.jpg' album={albums[0]} onClick={handler}/>
    );
    wrapper.simulate('click');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });

  it('should call the onDoubleClick handler when clicked', () => {
    const handler = jest.fn();
    const wrapper = mount(
      <CoverView src='path/to/image.jpg' album={albums[0]} onDoubleClick={handler}/>
    );
    wrapper.simulate('doubleClick');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });

  it('should call the onContextMenu handler when clicked', () => {
    const handler = jest.fn();
    const wrapper = mount(
      <CoverView src='path/to/image.jpg' album={albums[0]} onContextMenu={handler}/>
    );
    wrapper.simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });

  it('should call the onLoad onImageLoad once the image loads', () => {
    const src = 'path/to/image.jpg';
    const handler = jest.fn();
    const wrapper = mount(
      <CoverView src={src} album={albums[0]} onImageLoad={handler}/>
    );
    const img = wrapper.find('img');
    img.simulate('load');
    expect(handler).toHaveBeenCalledWith(src);
  });

  it('should be .loaded once the image loads', () => {
    const wrapper = mount(
      <CoverView src='path/to/image.jpg' album={albums[0]} />
    );
    const img = wrapper.find('img');
    img.simulate('load');
    expect(wrapper.find('figure').is('.loaded')).toBe(true);
  });
});
