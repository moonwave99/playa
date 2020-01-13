import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { PlaylistView } from '../PlaylistView/PlaylistView';
import { ApplicationState } from '../../store/store';
import { savePlaylistRequest } from '../../store/modules/playlist';
import { updateTitle } from '../../store/modules/ui';
import { getAlbumListRequest } from '../../store/modules/album';
import { confirmDialog } from '../../utils/dialogs';

export const PlaylistContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const { _id } = useParams();

  const playlist = useSelector((state: ApplicationState) => {
    const foundPlaylist = state.playlists.allById[_id];
    if (!foundPlaylist) {
      const now = new Date().toISOString();
      return {
        _id,
        _rev: null,
        title: 'New Playlist',
        created: now,
        accessed: now,
        albums: []
      }
    }
    return state.playlists.allById[_id];
  });

  const albums = useSelector((state: ApplicationState) => {
    return playlist.albums.map((id) => state.albums.allById[id]).filter(x => !!x);
  });

  useEffect(() => {
    dispatch(updateTitle(playlist.title));
  }, [playlist.title]);

  useEffect(() => {
    dispatch(getAlbumListRequest(playlist.albums));
  }, [playlist.albums.length]);

  function onTitleChange(title: string ): void {
    if (title === playlist.title) {
      return;
    }
    if (title === '') {
      confirmDialog({
        title: 'Playlist Rename',
        message: 'Playlist title cannot be empty.',
        buttons: ['OK']
      });
      return;
    }
    dispatch(savePlaylistRequest({ ...playlist, title }));
  }

	return (
    <PlaylistView
       albums={albums}
       playlist={playlist}
       onTitleChange={onTitleChange}/>
	);
};
