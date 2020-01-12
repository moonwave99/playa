import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AllPlaylistsView } from '../AllPlaylistsView/AllPlaylistsView';
import { Playlist, deletePlaylistRequest } from '../../store/modules/playlist';
import { updateTitle } from '../../store/modules/ui';

export const AllPlaylistContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const playlists = useSelector(({ playlists }) =>
    Object.keys(playlists.allById).map(id => playlists.allById[id])
  );

  useEffect(() => {
    dispatch(updateTitle('Playlists'));
  }, []);

  function onPlaylistDelete(playlist: Playlist): void {
    dispatch(deletePlaylistRequest(playlist));
  }

  return (
    <AllPlaylistsView
      onPlaylistDelete={onPlaylistDelete}
      playlists={playlists}/>
  );
};
