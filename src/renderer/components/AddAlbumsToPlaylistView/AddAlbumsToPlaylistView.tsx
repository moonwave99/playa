import React, { ReactElement, FC } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AlbumGridView } from '../LibraryView/AlbumGridView/AlbumGridView';
import { Playlist, selectors as playlistSelectors } from '../../store/modules/playlist';
import { Album, selectors as albumSelectors } from '../../store/modules/album';
import { ApplicationState } from '../../store/store';
import { formatDate } from '../../utils/datetimeUtils';
import { DATE_FORMATS } from '../../../constants';
import './AddAlbumsToPlaylistView.scss';

type AddAlbumsToPlaylistViewProps = {
  albumIDs: Album['_id'][];
  onPlaylistClick: Function;
}

export const AddAlbumsToPlaylistView: FC<AddAlbumsToPlaylistViewProps> = ({
  albumIDs,
  onPlaylistClick,
}): ReactElement => {
  const { t } = useTranslation();

  const { playlists, albums } = useSelector((state: ApplicationState) => ({
    playlists: playlistSelectors.withoutAlbums(state, albumIDs),
    albums: albumSelectors.findByList(state, albumIDs)
  }));

  function _onNewPlaylistClick(): void {
    onPlaylistClick();
  }

  function renderPlaylists(): ReactElement {
    function renderPlaylistItem(playlist: Playlist): ReactElement {
      function onClick(): void {
        onPlaylistClick(playlist);
      }
      const { _id, title, created } = playlist;
      const date = formatDate({ date: created, options: DATE_FORMATS.SHORT });
      return (
        <li key={_id} onClick={onClick}>
          <span className="playlist-date">{date}</span>
          <span className="playlist-title">{title}</span>
        </li>
      );
    }
    return (
      <ul className="playlist-list">
        <li className="new-playlist" onClick={_onNewPlaylistClick}>
          <span className="playlist-date">
            { formatDate({ date: new Date().toISOString(), options: DATE_FORMATS.SHORT }) }
          </span>
          <span className="playlist-title">
            { t('library.addAlbumsToPlaylist.newPlaylist') }
          </span>
        </li>
        { playlists.map(renderPlaylistItem) }
      </ul>
    );
  }

  return (
    <div className="add-albums-to-playlist">
      <AlbumGridView
        albums={albums}
        interactive={false}
        showTooltips={false}/>
      <h2>{ t('library.addAlbumsToPlaylist.title') }</h2>
      { renderPlaylists() }
    </div>
  );
}
