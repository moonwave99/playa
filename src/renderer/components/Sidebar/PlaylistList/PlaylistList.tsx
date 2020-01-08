import React, { FC } from 'react';
import { useRouteMatch } from 'react-router';
import { PlaylistListItem } from './PlaylistListItem/PlaylistListItem';
import { Playlist } from '../../../store/modules/playlist';
import { PLAYLIST_SHOW } from '../../../routes';
import './PlaylistList.scss';

type PlaylistListProps = {
  playlists: Playlist[];
}

type MatchParams = {
  _id?: string;
}

export const PlaylistList: FC<PlaylistListProps> = ({
  playlists = []
}) => {
  const match = useRouteMatch(PLAYLIST_SHOW);
  let params: MatchParams = {};

  if (match && match.params) {
    params = match.params;
  }

  return (
    <div className="playlist-list">
      <h2>Playlists</h2>
      <ul>
        { playlists.map(
          playlist => <PlaylistListItem
            key={playlist._id}
            isCurrent={playlist._id === params._id}
            playlist={playlist}/>
        ) }
      </ul>
    </div>
  );
}
