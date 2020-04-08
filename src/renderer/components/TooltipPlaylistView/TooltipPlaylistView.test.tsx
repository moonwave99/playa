import React from 'react';
import { renderInAll } from '../../../../test/testUtils';
import { playlists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import { TooltipPlaylistView } from './TooltipPlaylistView';

const defaultStore = {
  player: {
    queue: [] as string[]
  },
  playlists: {
    allById: toObj(playlists)
  },
  albums: {
    allById: toObj(playlists)
  },
  waveforms: {
    allById: {}
  }
};

describe('TooltipPlaylistView', () => {
  it('should render a .tooltip-album-view', () => {
		const wrapper = renderInAll(
			<TooltipPlaylistView
        playlist={playlists[0]}
        arrowRef={null}
        tooltipRef={null}
        placement="bottom"
        getArrowProps={jest.fn()}
        getTooltipProps={jest.fn()}/>
		, defaultStore);
		expect(wrapper.is('.tooltip-playlist-view')).toBe(true);
  });
});
