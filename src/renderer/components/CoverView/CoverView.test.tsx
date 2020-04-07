import React from 'react';
import { render, mount } from '../../../../test/testUtils';

import { CoverView } from './CoverView';
import { albums } from '../../../../test/testFixtures';

describe('CoverView', () => {
  it('should render a figure', () => {
    const wrapper = render(
      <CoverView src='path/to/image.jpg' album={albums[0]} />
    );
    expect(wrapper.is('figure')).toBe(true);
  });

  it('should have title attribute if showTitle is true', () => {
    const wrapper = render(
      <CoverView src='path/to/image.jpg' album={albums[0]} showTitle/>
    );
    expect(wrapper.attr('title')).toBeDefined();
    expect(wrapper.is('figure')).toBe(true);
  });

  it('should contain an <img> with an alt attribute', () => {
    const wrapper = render(
      <CoverView src='path/to/image.jpg' album={albums[0]} />
    );
    const img = wrapper.find('img');
    expect(img).toHaveLength(1);
    expect(img.attr('alt')).toBeDefined();
  });

  it('should contain an <img>.empty if src if empty', () => {
    const wrapper = render(
      <CoverView src='' album={albums[0]} />
    );
    expect(wrapper.find('img.empty')).toHaveLength(1);
  });

  it('should contain the passed className', () => {
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
    expect(handler).toHaveBeenCalled();
  });

  it('should call the onDoubleClick handler when clicked', () => {
    const handler = jest.fn();
    const wrapper = mount(
      <CoverView src='path/to/image.jpg' album={albums[0]} onDoubleClick={handler}/>
    );
    wrapper.simulate('doubleClick');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });

  it('should call the onContextMenu handler when right clicked', () => {
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
});
