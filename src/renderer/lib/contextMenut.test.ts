import { openContextMenu } from './contextMenu';
import { playlists, albums } from '../../../test/testFixtures';

import { ALBUM_CONTEXT_ACTIONS, AlbumActionsGroups } from '../actions/albumActions';
import { PLAYLIST_LIST_CONTEXT_ACTIONS } from '../actions/playlistListActions';

describe('openContextMenu', () => {
  const dispatch = jest.fn();
  it('should return a menu with given actions', () => {
    const menu = openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        album: albums[0],
        dispatch,
        actionGroups: [
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.ENQUEUE
        ]
      },
      {
        type: PLAYLIST_LIST_CONTEXT_ACTIONS,
        playlist: playlists[0],
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
