import { openContextMenu, openSimpleContextMenu } from './contextMenu';
import { playlists, albums, artists } from '../../../test/testFixtures';

import { ALBUM_CONTEXT_ACTIONS, AlbumActionsGroups } from '../actions/albumActions';
import { PLAYLIST_LIST_CONTEXT_ACTIONS } from '../actions/playlistListActions';

describe('openContextMenu', () => {
  const dispatch = jest.fn();
  it('should return a menu with given actions', () => {
    const menu = openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        albums: [{ album: albums[0], artist: artists[0] }],
        dispatch,
        actionGroups: [
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.ENQUEUE
        ]
      },
      {
        type: PLAYLIST_LIST_CONTEXT_ACTIONS,
        playlists,
        dispatch
      }
    ]);

    let separatorCount = 0;
    let actionsCount = 0;
    menu.items.forEach(({ type }: { type: string }) => {
      if (type === 'separator') {
        separatorCount++;
      } else {
        actionsCount++;
      }
    });

    expect(separatorCount).toBe(2);
    expect(actionsCount).toBe(5);
  });
});

describe('openSimpleContextMenu', () => {
  it('should return a menu with given actions', () => {
    const action =       {
      id: 'action-id',
      label: 'action-label',
      click: jest.fn()
    };
    const menu = openSimpleContextMenu([ action ]);
    expect(menu.items[0]).toEqual(action);
  });
});
