import React, { ReactElement, FC, useState } from 'react';
import { PlaylistViewTitle } from './PlaylistViewTitle/PlaylistViewTitle';
import { AlbumView } from './AlbumView/AlbumView';
import { CompactAlbumView } from './CompactAlbumView/CompactAlbumView';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import { UIAlbumView } from '../../store/modules/ui';
import './PlaylistView.scss';

type PlaylistViewProps = {
  albums: Album[];
  playlist: Playlist;
  onTitleChange: Function;
};

export const PlaylistView: FC<PlaylistViewProps> = ({
  albums,
  playlist,
  onTitleChange
}) => {
  const [albumView, setAlbumView] = useState(UIAlbumView.Extended);

  function onAlbumViewSwitchClick(): void {
    setAlbumView(albumView === UIAlbumView.Compact ? UIAlbumView.Extended : UIAlbumView.Compact);
  }

  function renderAlbumViewSwitch(): ReactElement {
    return <button
      className="playlist-album-view-switch"
      onClick={onAlbumViewSwitchClick}>Switch View</button>
  }

  function renderAlbum(album: Album): ReactElement {
    switch (albumView) {
      case UIAlbumView.Extended:
        return (
          <li key={album._id}>
            <AlbumView album={album}/>
          </li>
        );
      case UIAlbumView.Compact:
        return (
          <li key={album._id}>
            <CompactAlbumView album={album}/>
          </li>
        );
    }
  }

	return (
		<section className="playlist-view">
      <header className="playlist-header">
        {renderAlbumViewSwitch()}
        <PlaylistViewTitle
          playlist={playlist}
          onTitleChange={onTitleChange}/>
      </header>
      {
        albums.length > 0
          ? <ol className="album-list">{albums.map(renderAlbum)}</ol>
          : <p className="playlist-empty-placeholder">Playlist is empty.</p>
      }
    </section>
	);
}
