import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { PlaylistView } from '../PlaylistView/PlaylistView';
import { ApplicationState } from '../../store/store';
import { savePlaylistRequest, getDefaultPlaylist } from '../../store/modules/playlist';
import { updateQueue } from '../../store/modules/player';
import { updateState, updateTitle, showContextMenu } from '../../store/modules/ui';
import { Album, getAlbumListRequest } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { playTrack } from '../../store/modules/player';
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
    dispatch(updateTitle(`playlist: ${playlist.title}`));
  }, [playlist.title]);

  useEffect(() => {
    if (playlist._rev) {
      dispatch(updateState({ lastOpenedPlaylistId: _id }));
    }
  }, [playlist._id, playlist._rev]);

  useEffect(() => {
    if (playlist._rev && playlist.albums.length > 0) {
      dispatch(getAlbumListRequest(playlist.albums));
    }
  }, [playlist.albums, playlist._rev]);

  function onAlbumOrderChange(newOrder: string[]): void {
    dispatch(savePlaylistRequest({ ...playlist, albums: newOrder }));
    dispatch(updateQueue(newOrder.map(x => albums[x])));
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

  function onAlbumDoubleClick(album: Album, track: Track): void {
    dispatch(playTrack({
      playlistId: playlist._id,
      albumId: album._id,
      trackId: track ? track._id : null
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
       onAlbumContextMenu={onAlbumContextMenu}
       onAlbumDoubleClick={onAlbumDoubleClick}/>
	);
};
