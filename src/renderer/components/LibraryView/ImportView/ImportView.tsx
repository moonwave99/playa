import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlbumForm } from '../AlbumForm/AlbumForm';
import { TracklistView } from '../../AlbumListView/AlbumView/TracklistView/TracklistView';
import {
  Album,
  AlbumTypes,
  getDefaultAlbum
} from '../../../store/modules/album';
import { Artist } from '../../../store/modules/artist';
import { Track } from '../../../store/modules/track';
import { showTrackNumbers } from '../../../utils/albumUtils';
import { getYearFromPath } from '../../../utils/pathUtils';
import './ImportView.scss';

type ImportViewProps = {
  tracks: Track[];
  folderToImport: string;
  onFormSubmit: Function;
}

export const ImportView: FC<ImportViewProps> = ({
  tracks = [],
  folderToImport,
  onFormSubmit
}) => {
  const { t } = useTranslation();
  const [isAlbumFromVA, setAlbumFromVA] = useState(false);
  const [albumType, setAlbumType] = useState(AlbumTypes.Album);

  function _onFormSubmit({
    title,
    year,
    artist
  }: { title: string; year: number; artist: Artist }): void  {
    const album = {
      ...getDefaultAlbum(),
      title,
      year,
      isAlbumFromVA,
      type: albumType,
      artist: artist._id,
      path: folderToImport,
      tracks: tracks.map(({ _id }) => _id)
    };

    onFormSubmit({
      album,
      artist,
      tracks
    });
	}

  function onAlbumTypeChange(albumType: AlbumTypes): void {
    setAlbumType(albumType);
  }

  function onAlbumFromVAChange(isAlbumFromVA: boolean): void {
    setAlbumFromVA(isAlbumFromVA);
  }

  const album = {
    ...getDefaultAlbum(),
    year: getYearFromPath(folderToImport)
  };

  const proposedArtist = tracks[0].artist ? {
    name: tracks[0].artist
  } as Artist : null;

  return (
		<div className="import-view">
      <h2>
        <span>{t('library.importAlbum.title')}</span>
        <pre className="folder-name">
          <code>{folderToImport}</code>
        </pre>
      </h2>
      <AlbumForm
        artist={proposedArtist}
        albumType={albumType}
        isAlbumFromVA={isAlbumFromVA}
        className="line-after"
        onAlbumTypeChange={onAlbumTypeChange}
        onAlbumFromVAChange={onAlbumFromVAChange}
        album={album}
        onFormSubmit={_onFormSubmit}/>
      <TracklistView
        className="not-playable"
        tracks={tracks}
        tracklist={tracks.map(({ path }) => path)}
        showArtists={isAlbumFromVA}
        showTrackNumbers={showTrackNumbers({ type: albumType } as Album)}/>
    </div>
	);
}
