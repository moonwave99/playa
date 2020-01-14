import React, { FC } from 'react';
import { useRouteMatch } from 'react-router';
import { SidebarPlaylistListItem } from './SidebarPlaylistListItem/SidebarPlaylistListItem';
import { Playlist } from '../../../store/modules/playlist';
import { PLAYLIST_SHOW } from '../../../routes';
import './SidebarPlaylistList.scss';

type SidebarPlaylistListProps = {
  playlists: Playlist[];
}

type MatchParams = {
  _id?: string;
}

export const SidebarPlaylistList: FC<SidebarPlaylistListProps> = ({
  playlists = []
}) => {
  const match = useRouteMatch(PLAYLIST_SHOW);
  let params: MatchParams = {};

  if (match && match.params) {
    params = match.params;
  }

  return (
    <div className="sidebar-playlist-list">
      <h2>Recent Playlists</h2>
      <ul>
        { playlists.map(
          playlist => <SidebarPlaylistListItem
            key={playlist._id}
            isCurrent={playlist._id === params._id}
            playlist={playlist}/>
        ) }
      </ul>
    </div>
  );
}
