import * as React from 'react';
import { renderInAll, mountInAll } from '../../../../test/testUtils';
import { albums } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
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
  tracks: {
    allById: {}
  },
  covers: {
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

  it('should render a title', () => {
    const wrapper = renderInAll(<QueueView/>, defaultStore);
    expect(wrapper.find('h1')).toHaveLength(1);
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
    expect(document.title).toBe(`playback queue: ${albums.length} album(s)`);
  });
});
