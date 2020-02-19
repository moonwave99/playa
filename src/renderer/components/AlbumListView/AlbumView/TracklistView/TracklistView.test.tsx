import * as React from 'react';
import { render } from 'enzyme';

import { TracklistView } from './TracklistView';
import { tracks } from '../../../../../../test/testFixtures';

describe('TracklistView', () => {
  const tracklist = tracks.map(({ _id }) => _id);

  it('should render a .tracklist-view', () => {
    const wrapper = render(
      <TracklistView tracks={tracks} tracklist={tracklist}/>
    );
    expect(wrapper.is('.tracklist-view')).toBe(true);
  });

  it('should render n=tracklist.length <li>s', () => {
    const wrapper = render(
      <TracklistView tracks={tracks} tracklist={tracklist}/>
    );
    expect(wrapper.find('li')).toHaveLength(tracks.length);
  });

  it('should render <li.not-ready> if track is not found', () => {
    const wrapper = render(
      <TracklistView tracks={[tracks[0], {...tracks[1], found: false}]} tracklist={tracklist}/>
    );
    expect(wrapper.find('li.not-ready')).toHaveLength(1);
  });

  it('should render an empty list if both tracklist and tracklist are empty', () => {
    const wrapper = render(
      <TracklistView tracks={[]} tracklist={[]}/>
    );
    expect(wrapper.find('li')).toHaveLength(0);
  });
});
