import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AllPlaylistsView } from '../AllPlaylistsView/AllPlaylistsView';
import { Playlist, deletePlaylistRequest } from '../../store/modules/playlist';
import { updateTitle } from '../../store/modules/ui';
import { confirmDialog } from '../../utils/dialogs';

export const AllPlaylistContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const playlists = useSelector(({ playlists }) =>
    Object.keys(playlists.allById).map(id => playlists.allById[id])
  );

  useEffect(() => {
    dispatch(updateTitle('Playlists'));
  }, []);

  function onPlaylistDelete(playlist: Playlist): void {
    confirmDialog({
      title: 'Playlist Delete',
      message: `You are about to delete playlist '${playlist.title}', are you sure?`
    }).then((confirmed) => {
      if (confirmed) {
        onPlaylistDelete(playlist);
      }
    });
    dispatch(deletePlaylistRequest(playlist));
  }

  return (
    <AllPlaylistsView
      onPlaylistDelete={onPlaylistDelete}
      playlists={playlists}/>
  );
};
