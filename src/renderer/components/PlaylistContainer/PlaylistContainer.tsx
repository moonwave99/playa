import React, { ReactElement, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { IpcRendererEvent, ipcRenderer as ipc } from 'electron';
import { PlaylistView } from '../PlaylistView/PlaylistView';
import { ApplicationState } from '../../store/store';
import { Playlist, savePlaylist, deletePlaylist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';

export const PlaylistContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const { _id } = useParams();
  const [albums, setAlbums] = useState([]);
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

  useEffect(() => {
    ipc.send('album:get-list:request', playlist.albums);
    const listener = (_event: IpcRendererEvent, results: Album[]): void => {
      setAlbums(results);
    };
    ipc.on('album:get-list:response', listener);
    return (): void => {
      ipc.removeListener('album:get-list:response', listener);
    }
  });

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
