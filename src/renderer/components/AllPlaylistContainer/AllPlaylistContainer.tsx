import React, { FC, ReactElement, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AllPlaylistsView } from '../AllPlaylistsView/AllPlaylistsView';
import { Playlist, deletePlaylistRequest } from '../../store/modules/playlist';
import { updateTitle } from '../../store/modules/ui';
import { confirmDialog } from '../../lib/dialog';

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

  async function onPlaylistDelete(playlist: Playlist): Promise<void> {
    const confirmed = confirmDialog({
      title: 'Playlist Delete',
      message: `You are about to delete playlist '${playlist.title}', are you sure?`
    });
    if (confirmed) {
      dispatch(deletePlaylistRequest(playlist));
    }
  }

  return (
    <AllPlaylistsView
      onPlaylistDelete={onPlaylistDelete}
      playlists={playlists}/>
  );
};
