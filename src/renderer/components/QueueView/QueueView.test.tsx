import * as React from 'react';
import { renderInAll } from '../../../../test/testUtils';

import { QueueView } from './QueueView';

const defaultStore = {
  player: {
    queue: [] as string[]
  },
  playlists: {
    allById: {}
  },
  albums: {
    allById: {}
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

describe('QueueView tests', () => {
  it('should render a .queue', () => {
    const wrapper = renderInAll(<QueueView/>, defaultStore);
    expect(wrapper.is('.queue')).toBe(true);
  });

  it('should render a title', () => {
    const wrapper = renderInAll(<QueueView/>, defaultStore);
    expect(wrapper.find('h1')).toHaveLength(1);
  });

  it('should render an .queue-empty-placeholder if queue is empty', () => {
    const wrapper = renderInAll(<QueueView/>, defaultStore);
    expect(wrapper.find('.queue-empty-placeholder')).toHaveLength(1);
  });
});
