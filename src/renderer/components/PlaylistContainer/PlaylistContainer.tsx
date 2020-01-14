import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { PlaylistView } from '../PlaylistView/PlaylistView';
import { ApplicationState } from '../../store/store';
import { savePlaylistRequest, getDefaultPlaylist } from '../../store/modules/playlist';
import { updateState, updateTitle, showContextMenu } from '../../store/modules/ui';
import { Album, getAlbumListRequest } from '../../store/modules/album';
import { toObj } from '../../utils/storeUtils';
import { confirmDialog } from '../../utils/dialogUtils';
import { ContextMenuTypes } from '../../utils/contextMenuUtils';

export const PlaylistContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const { _id } = useParams();

  const {
    playlist,
    albums,
    currentPlaylistId,
    currentAlbumId,
    currentTrackId
  } = useSelector((state: ApplicationState) => {
    const playlist = state.playlists.allById[_id] || getDefaultPlaylist();
    const albums = playlist.albums.map((id) => state.albums.allById[id]).filter(x => !!x);
    return {
      playlist,
      albums: toObj(albums),
      ...state.player
    }
  });

  useEffect(() => {
    dispatch(updateTitle(playlist.title));
  }, [playlist.title]);

  useEffect(() => {
    dispatch(updateState({ lastOpenedPlaylistId: _id }));
  }, [playlist._id]);

  useEffect(() => {
    dispatch(getAlbumListRequest(playlist.albums));
  }, [playlist.albums]);

  function onAlbumOrderChange(newOrder: string[]): void {
    dispatch(savePlaylistRequest({ ...playlist, albums: newOrder }));
  }

  function onTitleChange(title: string ): void {
    if (title === playlist.title) {
      return;
    }
    if (title === '') {
      confirmDialog({
        title: 'Playlist Rename',
        message: 'Playlist title cannot be empty.',
        buttons: ['OK']
      });
      return;
    }
    dispatch(savePlaylistRequest({ ...playlist, title }));
  }

  function onAlbumContextMenu(album: Album): void {
    dispatch(showContextMenu({
      type: ContextMenuTypes.ALBUM_COVER,
      context: album
    }));
  }

	return (
    <PlaylistView
       albums={albums}
       playlist={playlist}
       isCurrent={currentPlaylistId === playlist._id}
       currentAlbumId={currentAlbumId}
       currentTrackId={currentTrackId}
       onAlbumOrderChange={onAlbumOrderChange}
       onTitleChange={onTitleChange}
       onAlbumContextMenu={onAlbumContextMenu}/>
	);
};
