import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AllPlaylistsView } from '../AllPlaylistsView/AllPlaylistsView';
import { updateTitle } from '../../store/modules/ui';

export const AllPlaylistContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const playlists = useSelector(({ playlists }) =>
    Object.keys(playlists.allById).map(id => playlists.allById[id])
  );

  useEffect(() => {
    dispatch(updateTitle('Playlists'));
  }, []);

  return (
    <AllPlaylistsView
      playlists={playlists}/>
  );
};
