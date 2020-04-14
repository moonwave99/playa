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
import {
  updateState,
  updateTitle,
  updatePlaylistAlbumSelection
} from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { Track } from '../../store/modules/track';
import { openContextMenu } from '../../lib/contextMenu';

import {
  PLAYLIST_CONTENT_CONTEXT_ACTIONS,
  PlaylistContentActions,
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

  useEffect(() => {
    return (): void => {
      updatePlaylistAlbumSelection(null, []);
    }
  }, []);

  function onSelectionChange(selection: Album['_id'][]): void {
    updatePlaylistAlbumSelection(playlist._id, selection);
  }

  function onAlbumOrderChange(newOrder: Album['_id'][]): void {
    dispatch(savePlaylistRequest({ ...playlist, albums: newOrder }));
    if (playlist._id === currentPlaylistId) {
      dispatch(updateQueue(newOrder.map(x => albums[x]._id)));
    }
  }

  function onAlbumContextMenu({
    album,
    artist,
    selection = []
  }: {
    album: Album;
    artist: Artist;
    selection: Album['_id'][];
  }): void {
    const menuSelection = [
      album,
      ...selection
        .filter(_id => _id !== album._id)
        .map(_id => ({ _id }))
    ] as Album[];
    openContextMenu([
      {
        type: PLAYLIST_CONTENT_CONTEXT_ACTIONS,
        playlist,
        selection,
        dispatch
      },
      {
        type: ALBUM_CONTEXT_ACTIONS,
        selection: menuSelection,
        artist,
        queue: playlist.albums,
        dispatch,
        actionGroups: [
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.EDIT,
          AlbumActionsGroups.SYSTEM,
          AlbumActionsGroups.SEARCH_ONLINE
        ]
      }
    ]);
  }

  function onAlbumDoubleClick({
    album,
    track
  }: {
    album: Album;
    track: Track;
  }): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      queue: playlist.albums,
      playlistId: playlist._id,
      selection: [album],
      trackId: track ? track._id : null,
      dispatch
    }).handler();
  }

  function onAlbumEnter(selection: Album['_id'][]): void {
    if (selection.length === 0) {
      return;
    }
    actionsMap(AlbumActions.PLAY_ALBUM)({
      queue: playlist.albums,
      playlistId: playlist._id,
      selection: selection.map(_id => ({ _id })) as Album[],
      dispatch
    }).handler();
  }

  function onAlbumBackspace(selection: Album['_id'][]): void {
    actionsMap(PlaylistContentActions.REMOVE_ALBUMS)({
      selection,
      playlist,
      dispatch
    }).handler();
  }

  if (!playlist._id) {
    return <Redirect to={QUEUE}/>;
  }

  const shouldShowPlaylist = !isLoading && playlist.albums.length === Object.keys(albums).length;
  if (!shouldShowPlaylist) {
    return null;
  }
	return (
    <CSSTransition
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
        onSelectionChange={onSelectionChange}
        onAlbumOrderChange={onAlbumOrderChange}
        onAlbumEnter={onAlbumEnter}
        onAlbumBackspace={onAlbumBackspace}
        onAlbumContextMenu={onAlbumContextMenu}
        onAlbumDoubleClick={onAlbumDoubleClick}/>
     </CSSTransition>
	);
};
