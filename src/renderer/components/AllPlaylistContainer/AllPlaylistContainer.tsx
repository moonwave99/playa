import React, { FC, ReactElement, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AllPlaylistsView } from '../AllPlaylistsView/AllPlaylistsView';
import { Playlist, deletePlaylistRequest } from '../../store/modules/playlist';
import { updateTitle } from '../../store/modules/ui';
import { confirmDialog } from '../../utils/dialogUtils';

type AllPlaylistContainerProps = {
  playlists: Playlist[];
}

export const AllPlaylistContainer: FC<AllPlaylistContainerProps> = ({
  playlists = []
}): ReactElement => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateTitle('playlists: all'));
  }, []);

  function onPlaylistDelete(playlist: Playlist): void {
    confirmDialog({
      title: 'Playlist Delete',
      message: `You are about to delete playlist '${playlist.title}', are you sure?`
    }).then((confirmed) => {
      if (confirmed) {
        dispatch(deletePlaylistRequest(playlist));
      }
    });
  }

  return (
    <AllPlaylistsView
      onPlaylistDelete={onPlaylistDelete}
      playlists={playlists}/>
  );
};
