import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { PlaylistView } from '../PlaylistView/PlaylistView';

import {
  Playlist,
  getPlaylistsRequest,
  savePlaylistRequest,
  getDefaultPlaylist
} from '../../store/modules/playlist';

import { updateQueue } from '../../store/modules/player';
import { updateState, updateTitle } from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { toObj } from '../../utils/storeUtils';
import { openContextMenu } from '../../lib/contextMenu';

import {
  PLAYLIST_CONTENT_CONTEXT_ACTIONS,
  PlaylistContentActions
} from '../../actions/playlistContentActions';

import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActions,
  AlbumActionsGroups
} from '../../actions/albumActions';

import actionsMap, { AllActions } from '../../actions/actions';

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
      dispatch(updateState({ lastOpenedPlaylistId: playlist._id }));
    }
  }, [playlist._id, playlist._rev]);

  useEffect(() => {
    if (playlist._rev) {
      dispatch(getPlaylistsRequest(playlist._id));
    }
  }, [playlist]);

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
        queue: playlist.albums,
        dispatch,
        actionGroups: [
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.SYSTEM,
          AlbumActionsGroups.SEARCH_ONLINE
        ]
      }
    ]);
  }

  function onAlbumDoubleClick(album: Album, track: Track): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      queue: playlist.albums,
      playlistId: playlist._id,
      album,
      trackId: track ? track._id : null,
      dispatch
    }).handler();
  }

  function albumActionHandler(action: AllActions, album: Album): void {
    switch (action) {
      case PlaylistContentActions.REMOVE_ALBUM:
        actionsMap(PlaylistContentActions.REMOVE_ALBUM)({
          playlist,
          selection: [album._id],
          dispatch
        }).handler();
        break;
      case AlbumActions.REVEAL_IN_FINDER:
        actionsMap(AlbumActions.REVEAL_IN_FINDER)({
          album,
          dispatch
        }).handler();
        break;
    }
  }

	return (
    <PlaylistView
       albums={albums}
       playlist={playlist}
       isCurrent={currentPlaylistId === playlist._id}
       currentAlbumId={currentAlbumId}
       currentTrackId={currentTrackId}
       albumActionHandler={albumActionHandler}
       onAlbumOrderChange={onAlbumOrderChange}
       onTitleChange={onTitleChange}
       onAlbumContextMenu={onAlbumContextMenu}
       onAlbumDoubleClick={onAlbumDoubleClick}/>
	);
};
