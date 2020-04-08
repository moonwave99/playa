import React, { FC, ReactElement, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { PlaylistGridView } from '../PlaylistGridView/PlaylistGridView';
import { Playlist } from '../../store/modules/playlist';
import { updateTitle, updatePlaylistListSelection } from '../../store/modules/ui';
import { openContextMenu } from '../../lib/contextMenu';
import './AllPlaylistContainer.scss';
import actionsMap from '../../actions/actions';

import {
  PLAYLIST_LIST_CONTEXT_ACTIONS,
  PlaylistListActions
} from '../../actions/playlistListActions';

type AllPlaylistContainerProps = {
  playlists: Playlist[];
  currentPlaylistId: Playlist['_id'];
}

export const AllPlaylistContainer: FC<AllPlaylistContainerProps> = ({
  playlists = [],
  currentPlaylistId
}): ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateTitle({
      main: t('playlists.all.title')
    }));
  }, []);

  useEffect(() => {
    return (): void => {
      updatePlaylistListSelection([]);
    }
  }, []);

  function onPlaylistContextMenu({
    playlist,
    selection
  }: {
    playlist: Playlist;
    selection: Playlist['_id'][];
  }): void {
    const menuPlaylists = [
      playlist,
      ...selection
        .filter(_id => _id !== playlist._id)
        .map(x => playlists.find(({ _id }) => _id === x))
    ] as Playlist[];

    openContextMenu([
      {
        type: PLAYLIST_LIST_CONTEXT_ACTIONS,
        playlists: menuPlaylists,
        dispatch
      }
    ]);
  }

  async function onPlaylistDelete(playlists: Playlist[]): Promise<void> {
    actionsMap(PlaylistListActions.DELETE_PLAYLISTS)({
      playlists,
      dispatch
    }).handler();
  }

  function onSelectionChange(selection: Playlist['_id'][]): void {
    updatePlaylistListSelection(selection);
  }

  return (
    <section className="all-playlists">{
      playlists.length === 0
        ? <section className="all-playlists-empty-placeholder">{t('playlists.all.empty')}</section>
        : <PlaylistGridView
            playlists={playlists}
            currentPlaylistId={currentPlaylistId}
            onPlaylistContextMenu={onPlaylistContextMenu}
            onPlaylistDelete={onPlaylistDelete}
            onSelectionChange={onSelectionChange}/>
      }</section>
  );
};
