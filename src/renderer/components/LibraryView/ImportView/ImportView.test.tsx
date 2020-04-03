import React from 'react';
import { renderInAll } from '../../../../../test/testUtils';
import { playlists, albums, artists, tracks } from '../../../../../test/testFixtures';
import { toObj } from '../../../utils/storeUtils';
import { ImportView } from './ImportView';

const defaultStore = {
  player: {
    queue: [] as string[]
  },
  playlists: {
    allById: toObj(playlists)
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


describe('ImportView', () => {
  it('should render an .import-view', () => {
    const wrapper = renderInAll(
      <ImportView
        onFormSubmit={jest.fn()}
        folderToImport='/path/to/folder'
        tracks={tracks}/>
    , defaultStore);
    expect(wrapper.is('.import-view')).toBe(true);
  });

  it('should contain a title with the folder name', () => {
    const wrapper = renderInAll(
      <ImportView
        onFormSubmit={jest.fn()}
        folderToImport='/path/to/folder'
        tracks={tracks}/>
    , defaultStore);
    expect(wrapper.find('code').text()).toBe('/path/to/folder');
  });

  it('should contain an .album-form', () => {
    const wrapper = renderInAll(
      <ImportView
        onFormSubmit={jest.fn()}
        folderToImport='/path/to/folder'
        tracks={tracks}/>
    , defaultStore);
    expect(wrapper.find('.album-form')).toHaveLength(1);
  });

  it('should contain a .tracklist-view', () => {
    const wrapper = renderInAll(
      <ImportView
        onFormSubmit={jest.fn()}
        folderToImport='/path/to/folder'
        tracks={tracks}/>
    , defaultStore);
    expect(wrapper.find('.tracklist-view')).toHaveLength(1);
  });
});
