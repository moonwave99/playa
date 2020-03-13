import React from 'react';
import { render, mount, renderInRouter } from '../../../../../../../test/testUtils';

import { TracklistViewItem } from './TracklistViewItem';
import { tracks } from '../../../../../../../test/testFixtures';

describe('TracklistViewItem', () => {
  it('should render a .tracklist-item', () => {
    const wrapper = render(
      <TracklistViewItem track={tracks[0]}/>
    );
    expect(wrapper.is('.tracklist-item')).toBe(true);
  });

  it('should be .is-current if track is current', () => {
    const wrapper = render(
      <TracklistViewItem track={tracks[0]} isCurrent/>
    );
    expect(wrapper.is('.is-current')).toBe(true);
  });

  it('should contain a .track-title containing the track title', () => {
    const track = tracks[0];
    const wrapper = render(
      <TracklistViewItem track={tracks[0]}/>
    );
    expect(wrapper.find('.track-title').text()).toEqual(track.title);
  });

  it('should contain a .track-number containing the track number', () => {
    const wrapper = render(
      <TracklistViewItem track={tracks[0]}/>
    );
    expect(wrapper.find('.track-number').text()).toEqual('01');
  });

  it('should contain a .hidden.track-number if showTrackNumber is false', () => {
    const wrapper = render(
      <TracklistViewItem track={tracks[0]} showTrackNumber={false}/>
    );
    expect(wrapper.find('.track-number.hidden')).toHaveLength(1);
  });

  it('should contain a .track-duration containing the formatted track duration', () => {
    const wrapper = render(
      <TracklistViewItem track={tracks[0]}/>
    );
    expect(wrapper.find('.track-duration').text()).toEqual('02:03');
  });

  it('should contain a .track-artist containing the track artist(s) if showArtists is true', () => {
    const track = tracks[0];
    const wrapper = renderInRouter(
      <TracklistViewItem track={tracks[0]} showArtists/>
    );
    expect(wrapper.find('.track-artist').text()).toEqual(track.artist);
  });

  it('should call the onDoubleClick handler when clicked', () => {
    const handler = jest.fn();
    const wrapper = mount(
      <TracklistViewItem track={tracks[0]} onDoubleClick={handler}/>
    );
    wrapper.simulate('doubleClick');
    expect(handler).toHaveBeenCalledWith(tracks[0]);
  });
});
