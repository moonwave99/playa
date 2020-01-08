import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { PlaylistView } from '../PlaylistView/PlaylistView';
import { ApplicationState } from '../../store/store';
import { Playlist, savePlaylist, deletePlaylist } from '../../store/modules/playlist';
import { Album, getAlbumListRequest } from '../../store/modules/album';

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
    return playlist.albums.length > 0
     ? state.albums.currentList as Album[]
     : [];
  });

  useEffect(() => {
    if (playlist.albums.length > 0) {
      dispatch(getAlbumListRequest(playlist.albums));
    }
  }, [playlist.albums]);

  function handleSavePlaylist(changedPlaylist: Playlist ): void {
    dispatch(savePlaylist(changedPlaylist));
  }

  function handleDeletePlaylist(): void {
    dispatch(deletePlaylist(playlist));
  }

	return (
     <PlaylistView
        albums={albums}
        playlist={playlist}
        savePlaylist={handleSavePlaylist}
        deletePlaylist={handleDeletePlaylist}/>
	);
};
