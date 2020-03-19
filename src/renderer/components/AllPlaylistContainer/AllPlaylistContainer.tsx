import React, { FC, ReactElement, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AllPlaylistsView } from '../AllPlaylistsView/AllPlaylistsView';
import { Playlist } from '../../store/modules/playlist';
import { updateTitle } from '../../store/modules/ui';
import { openContextMenu } from '../../lib/contextMenu';

import actionsMap from '../../actions/actions';

import {
  PLAYLIST_LIST_CONTEXT_ACTIONS,
  PlaylistListActions
} from '../../actions/playlistListActions';

type AllPlaylistContainerProps = {
  playlists: Playlist[];
}

export const AllPlaylistContainer: FC<AllPlaylistContainerProps> = ({
  playlists = []
}): ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateTitle({
      main: t('playlists.all.title')
    }));
  }, []);

  function onPlaylistContextMenu(playlist: Playlist): void {
    openContextMenu([
      {
        type: PLAYLIST_LIST_CONTEXT_ACTIONS,
        playlist,
        dispatch
      }
    ]);
  }

  async function onPlaylistDelete(playlist: Playlist): Promise<void> {
    actionsMap(PlaylistListActions.DELETE_PLAYLIST)({
      playlist,
      dispatch
    }).handler();
  }

  return (
    <AllPlaylistsView
      onPlaylistContextMenu={onPlaylistContextMenu}
      onPlaylistDelete={onPlaylistDelete}
      playlists={playlists}/>
  );
};
