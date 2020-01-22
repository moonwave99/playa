import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { PlaylistView } from '../PlaylistView/PlaylistView';
import { savePlaylistRequest, getDefaultPlaylist } from '../../store/modules/playlist';
import { updateQueue } from '../../store/modules/player';
import { updateState, updateTitle } from '../../store/modules/ui';
import { Playlist } from '../../store/modules/playlist';
import { Album, getAlbumListRequest } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { playTrack } from '../../store/modules/player';
import { toObj } from '../../utils/storeUtils';
import { confirmDialog } from '../../lib/dialog';
import { openContextMenu } from '../../lib/contextMenu/contextMenu';
import { PLAYLIST_CONTENT_CONTEXT_ACTIONS } from '../../lib/contextMenu/actions/playlistContent';
import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionItems
} from '../../lib/contextMenu/actions/album';

export const PlaylistContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const { _id } = useParams();

  const {
    playlist,
    albums,
    currentPlaylistId,
    currentAlbumId,
    currentTrackId
  } = useSelector(({ playlists, albums, player }) => {
    const playlist: Playlist = playlists.allById[_id] || getDefaultPlaylist();
    return {
      playlist,
      albums: toObj(
        playlist.albums.map((id) => albums.allById[id]).filter(x => !!x)
      ),
      ...player
    }
  });

  useEffect(() => {
    dispatch(updateTitle(`playlist: ${playlist.title}`));
  }, [playlist.title]);

  useEffect(() => {
    if (playlist._rev) {
      dispatch(updateState({ lastOpenedPlaylistId: _id }));
    }
  }, [playlist._id, playlist._rev]);

  useEffect(() => {
    if (playlist._rev && playlist.albums.length > 0) {
      dispatch(getAlbumListRequest(playlist.albums));
    }
  }, [playlist.albums, playlist._rev]);

  function onAlbumOrderChange(newOrder: string[]): void {
    dispatch(savePlaylistRequest({ ...playlist, albums: newOrder }));
    if (playlist._id === currentPlaylistId) {
      dispatch(updateQueue(newOrder.map(x => albums[x]._id)));
    }
  }

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

  function onAlbumContextMenu(album: Album): void {
    openContextMenu([
      {
        type: PLAYLIST_CONTENT_CONTEXT_ACTIONS,
        playlist,
        selection: [album._id],
        dispatch
      },
      {
        type: ALBUM_CONTEXT_ACTIONS,
        album,
        dispatch,
        actions: [
          AlbumActionItems.PLAYBACK,
          AlbumActionItems.SYSTEM,
          AlbumActionItems.SEARCH_ONLINE
        ]
      }
    ]);
  }

  function onAlbumDoubleClick(album: Album, track: Track): void {
    dispatch(updateQueue(playlist.albums));
    dispatch(playTrack({
      playlistId: playlist._id,
      albumId: album._id,
      trackId: track ? track._id : null
    }));
  }

	return (
    <PlaylistView
       albums={albums}
       playlist={playlist}
       isCurrent={currentPlaylistId === playlist._id}
       currentAlbumId={currentAlbumId}
       currentTrackId={currentTrackId}
       onAlbumOrderChange={onAlbumOrderChange}
       onTitleChange={onTitleChange}
       onAlbumContextMenu={onAlbumContextMenu}
       onAlbumDoubleClick={onAlbumDoubleClick}/>
	);
};
