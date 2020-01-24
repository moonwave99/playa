import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SidebarPlaylistListItem } from './SidebarPlaylistListItem/SidebarPlaylistListItem';
import { Playlist } from '../../../store/modules/playlist';
import { playTrack, updateQueue } from '../../../store/modules/player';
import { PLAYLIST_SHOW } from '../../../routes';
import { openContextMenu } from '../../../lib/contextMenu/contextMenu';
import {
  PLAYLIST_LIST_CONTEXT_ACTIONS,
  PlaylistListActionItems
} from '../../../lib/contextMenu/actions/playlistList';

import './SidebarPlaylistList.scss';

type SidebarPlaylistListProps = {
  playlists: Playlist[];
  currentPlaylistId: Playlist['_id'];
}

type MatchParams = {
  _id?: string;
}

export const SidebarPlaylistList: FC<SidebarPlaylistListProps> = ({
  playlists = [],
  currentPlaylistId
}) => {
  const { t } = useTranslation();
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
        dispatch,
        actions: [
          PlaylistListActionItems.PLAY_PLAYLIST,
          PlaylistListActionItems.DELETE_PLAYLIST
        ]
      }
    ]);
  }

  function onPlayButtonDoubleClick({ _id, albums }: Playlist): void {
    if (albums.length === 0) {
      return;
    }
    dispatch(updateQueue(albums));
    dispatch(playTrack({ playlistId: _id, albumId: albums[0]}));
  }

  return (
    <div className="sidebar-playlist-list">
      <h2>{t('sidebar.buttons.playlist.recent')}</h2>
      <ul>
        { playlists.map(
          playlist => <SidebarPlaylistListItem
            key={playlist._id}
            isCurrent={playlist._id === params._id}
            isPlaying={playlist._id === currentPlaylistId}
            playlist={playlist}
            onContextMenu={onPlaylistContextMenu}
            onPlayButtonDoubleClick={onPlayButtonDoubleClick}/>
        ) }
      </ul>
    </div>
  );
}
