import React from 'react';
import { renderInAll, mountInAll } from '../../../../test/testUtils';
import { albums, artists, tracks } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import { TooltipAlbumView } from './TooltipAlbumView';

const defaultStore = {
  player: {
    queue: [] as string[]
  },
  playlists: {
    allById: {}
  },
  albums: {
    allById: {
      '1': {
        ...albums[0],
        tracks: [tracks[0]._id, tracks[1]._id]
      }
    }
  },
  artists: {
    allById: toObj(artists)
  },
  tracks: {
    allById: toObj(tracks)
  },
  waveforms: {
    allById: {}
  }
};

describe('TooltipAlbumView', () => {
  it('should render a .tooltip-album-view', () => {
		const wrapper = renderInAll(
			<TooltipAlbumView
        album={albums[0]}
        currentTrackId={null}
        onDoubleClick={jest.fn()}
        arrowRef={null}
        tooltipRef={null}
        placement="bottom"
        getArrowProps={jest.fn()}
        getTooltipProps={jest.fn()}
        />
		, defaultStore);
		expect(wrapper.is('.tooltip-album-view')).toBe(true);
  });

  it('should call the onDoubleClick handler when a track is double clicked', () => {
    const handler = jest.fn();
    const album = {
      ...albums[0],
      tracks: [tracks[0]._id, tracks[1]._id]
    };
		const wrapper = mountInAll(
			<TooltipAlbumView
        album={album}
        currentTrackId={null}
        onDoubleClick={handler}
        arrowRef={null}
        tooltipRef={null}
        placement="bottom"
        getArrowProps={jest.fn()}
        getTooltipProps={jest.fn()}
        />
		, defaultStore);

    wrapper.find('.tracklist-item').at(1).simulate('doubleclick');

    expect(handler).toHaveBeenCalledWith(album, artists[0], tracks[1]);
  });
});
