import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { PlaylistListItem } from './PlaylistListItem/PlaylistListItem';
import { Playlist } from '../../../store/modules/playlist';
import { PLAYLIST_SHOW } from '../../../routes';
import { openContextMenu } from '../../../lib/contextMenu';

import {
  PLAYLIST_LIST_CONTEXT_ACTIONS,
  PlaylistListActions
} from '../../../actions/playlistListActions';

import actionsMap from '../../../actions/actions';

import './PlaylistList.scss';

type PlaylistListProps = {
  playlists: Playlist[];
  currentPlaylistId: Playlist['_id'];
}

type MatchParams = {
  _id?: string;
}

export const PlaylistList: FC<PlaylistListProps> = ({
  playlists = [],
  currentPlaylistId
}) => {
  const dispatch = useDispatch();
  const match = useRouteMatch(PLAYLIST_SHOW);
  let params: MatchParams = {};

  if (match && match.params) {
    params = match.params;
  }

  function onPlaylistContextMenu(playlist: Playlist): void {
    openContextMenu([
      {
        type: PLAYLIST_LIST_CONTEXT_ACTIONS,
        playlist,
        dispatch
      }
    ]);
  }

  function onPlayButtonDoubleClick(playlist: Playlist): void {
    actionsMap(PlaylistListActions.PLAY_PLAYLIST)({
      playlist,
      dispatch
    }).handler();
  }

  return (
    <ul className="playlist-list">
      { playlists.map(
        playlist => <PlaylistListItem
          key={playlist._id}
          isCurrent={playlist._id === params._id}
          isPlaying={playlist._id === currentPlaylistId}
          playlist={playlist}
          onContextMenu={onPlaylistContextMenu}
          onPlayButtonDoubleClick={onPlayButtonDoubleClick}/>
      ) }
    </ul>
  );
}
