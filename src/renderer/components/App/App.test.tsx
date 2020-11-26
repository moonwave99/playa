import React from 'react';
import { MockAudioElement } from '../../../../test/mockAudioElement'
import { mountInAll, simulateClick } from '../../../../test/testUtils';
import { albums, artists } from '../../../../test/testFixtures';
import { toObj } from '../../utils/storeUtils';
import Player from '../../lib/player';

import { App } from './App';

const defaultStore = {
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
  },
  player: {
    currentAlbumId: null as string,
    queue: [] as string[]
  },
  ui: {
    title: {}
  },
  library: {
    latest: [] as string[]
  }
};

describe('App', () => {
  it('should render an .app', () => {
		const wrapper = mountInAll(
			<App
        player={new Player({ audioElement: new MockAudioElement() })}
        queue={[]}
        waveformBasePath="/path/to/waveforms"
        lastOpenedPlaylistId={null}
        onLibraryScroll={jest.fn()}/>
		, defaultStore);
		expect(wrapper.find('.app')).toHaveLength(1);
  });

  it('should render the edit album modal if editingAlbum', () => {
		const wrapper = mountInAll(
			<App
        player={new Player({ audioElement: new MockAudioElement() })}
        queue={[]}
        waveformBasePath="/path/to/waveforms"
        lastOpenedPlaylistId={null}
        onLibraryScroll={jest.fn()}/>
		, {
        ...defaultStore,
        albums: {
          ...defaultStore.albums,
          editingAlbumId: '1'
        }
      }
    );
		expect(document.body.classList.contains('ReactModal__Body--open')).toBe(true);
    wrapper.unmount();
  });

  it('should close the edit album modal if the overlay is clicked', () => {
		const wrapper = mountInAll(
			<App
        player={new Player({ audioElement: new MockAudioElement() })}
        queue={[]}
        waveformBasePath="/path/to/waveforms"
        lastOpenedPlaylistId={null}
        onLibraryScroll={jest.fn()}/>
		, {
        ...defaultStore,
        albums: {
          ...defaultStore.albums,
          editingAlbumId: '1'
        }
      }
    );
		expect(document.body.classList.contains('ReactModal__Body--open')).toBe(true);
    simulateClick('.modal-overlay');
    expect(document.body.classList.contains('ReactModal__Body--open')).toBe(false);
    wrapper.unmount();
  });

  it('should close the edit album modal if the form is submit', () => {
		mountInAll(
			<App
        player={new Player({ audioElement: new MockAudioElement() })}
        queue={[]}
        waveformBasePath="/path/to/waveforms"
        lastOpenedPlaylistId={null}
        onLibraryScroll={jest.fn()}/>
		, {
        ...defaultStore,
        albums: {
          ...defaultStore.albums,
          editingAlbumId: '1'
        }
      }
    );
		expect(document.body.classList.contains('ReactModal__Body--open')).toBe(true);
    simulateClick('.edit-album button[type="submit"]');
  });
});
