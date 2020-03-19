import React, { ReactElement, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import { PlaylistView } from '../PlaylistView/PlaylistView';

import {
  getPlaylistRequest,
  savePlaylistRequest,
  getPlaylistById
} from '../../store/modules/playlist';

import { ApplicationState } from '../../store/store';
import { updateQueue } from '../../store/modules/player';
import { updateState, updateTitle } from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { Track } from '../../store/modules/track';
import { openContextMenu } from '../../lib/contextMenu';

import {
  PLAYLIST_CONTENT_CONTEXT_ACTIONS,
} from '../../actions/playlistContentActions';

import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActions,
  AlbumActionsGroups
} from '../../actions/albumActions';

import { QUEUE } from '../../routes';

import actionsMap from '../../actions/actions';

export const PlaylistContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const { _id } = useParams();

  const {
    playlist,
    albums,
    currentPlaylistId,
    currentAlbumId,
    currentTrackId,
    isLoading
  } = useSelector((state: ApplicationState) => getPlaylistById(state, _id));

  useEffect(() => {
    dispatch(updateTitle({
      main: playlist.title
    }));
  }, [playlist.title]);

  useEffect(() => {
    if (playlist._rev) {
      dispatch(updateState({ lastOpenedPlaylistId: playlist._id }));
    }
  }, [playlist._id, playlist._rev]);

  useEffect(() => {
    if (playlist._rev) {
      dispatch(getPlaylistRequest(playlist._id));
    }
  }, [playlist]);

  function onAlbumOrderChange(newOrder: string[]): void {
    dispatch(savePlaylistRequest({ ...playlist, albums: newOrder }));
    if (playlist._id === currentPlaylistId) {
      dispatch(updateQueue(newOrder.map(x => albums[x]._id)));
    }
  }

  function onAlbumContextMenu(album: Album, artist: Artist): void {
    openContextMenu([
      {
        type: PLAYLIST_CONTENT_CONTEXT_ACTIONS,
        playlist,
        selection: [album._id],
        dispatch
      },
      {
        type: ALBUM_CONTEXT_ACTIONS,
        albums: [{ album, artist }],
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

  function onAlbumDoubleClick(album: Album, artist: Artist, track: Track): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      queue: playlist.albums,
      playlistId: playlist._id,
      albums: [{ album, artist }],
      trackId: track ? track._id : null,
      dispatch
    }).handler();
  }

	return (
    !playlist._id
      ? <Redirect to={QUEUE}/>
      : <CSSTransition
          in={!isLoading}
          timeout={300}
          classNames="playlist-view"
          unmountOnExit>
          <PlaylistView
           albums={albums}
           playlist={playlist}
           isCurrent={currentPlaylistId === playlist._id}
           currentAlbumId={currentAlbumId}
           currentTrackId={currentTrackId}
           onAlbumOrderChange={onAlbumOrderChange}
           onAlbumContextMenu={onAlbumContextMenu}
           onAlbumDoubleClick={onAlbumDoubleClick}/>
       </CSSTransition>
	);
};
