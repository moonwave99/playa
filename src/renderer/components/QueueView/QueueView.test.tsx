import React from 'react';
import { renderInAll, mountInAll } from '../../../../test/testUtils';
import { albums, artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
jest.mock('../../lib/contextMenu');
const { openContextMenu } = require('../../lib/contextMenu'); // eslint-disable-line
import { QueueView } from './QueueView';

const defaultStore = {
  player: {
    queue: [] as string[]
  },
  playlists: {
    allById: {}
  },
  albums: {
    allById: toObj(albums)
  },
  artists: {
    allById: toObj(artists)
  },
  tracks: {
    allById: {}
  },
  waveforms: {
    allById: {}
  }
};

describe('QueueView', () => {
  it('should render a .queue', () => {
    const wrapper = renderInAll(<QueueView/>, defaultStore);
    expect(wrapper.is('.queue')).toBe(true);
  });

  it('should render a .queue-empty-placeholder if queue is empty', () => {
    const wrapper = renderInAll(<QueueView/>, defaultStore);
    expect(wrapper.find('.queue-empty-placeholder')).toHaveLength(1);
    expect(wrapper.find('.album-list')).toHaveLength(0);
  });

  it('should render an .album-list if queue is not empty', () => {
    const wrapper = renderInAll(<QueueView/>, {
      ...defaultStore,
      player: {
        queue: albums.map(({ _id }) => _id)
      }
    });
    expect(wrapper.find('.queue-empty-placeholder')).toHaveLength(0);
    expect(wrapper.find('.album-list')).toHaveLength(1);
  });

  it('should update page title with queue info', () => {
    mountInAll(<QueueView/>, {
      ...defaultStore,
      player: {
        queue: albums.map(({ _id }) => _id)
      }
    });
    expect(document.title).toBe('Playback Queue');
  });

  it('should call the onAlbumContextMenu handler when an album is right clicked', () => {
    const handler = jest.fn();
    openContextMenu.mockImplementation(handler);
    const wrapper = mountInAll(<QueueView/>, {
      ...defaultStore,
      player: {
        queue: albums.map(({ _id }) => _id)
      }
    });
    wrapper.find('.album-view').at(0).simulate('contextmenu');
    expect(handler.mock.calls[0][0]).toHaveLength(1);
    expect(handler.mock.calls[0][0][0].albums).toEqual([{ album: albums[0], artist: artists[0] }]);
  });
});
