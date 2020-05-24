import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AlbumForm } from '../AlbumForm/AlbumForm';
import {
  Album,
  AlbumTypes
} from '../../../store/modules/album';
import { Artist, selectors as artistSelectors } from '../../../store/modules/artist';
import { ApplicationState } from '../../../store/store';
import './EditAlbumView.scss';

type EditAlbumViewProps = {
  album: Album;
  onFormSubmit: Function;
}

export const EditAlbumView: FC<EditAlbumViewProps> = ({
  album,
  onFormSubmit
}) => {
  const { t } = useTranslation();
  const [isAlbumFromVA, setAlbumFromVA] = useState(album.isAlbumFromVA);
  const [albumType, setAlbumType] = useState(album.type);
  const artist = useSelector((state: ApplicationState) => artistSelectors.findById(state, album.artist));
  const { path } = album;

  function _onFormSubmit({
    title,
    year,
    artist
  }: { title: string; year: number; artist: Artist }): void  {
    const updatedAlbum = {
      ...album,
      title,
      year,
      isAlbumFromVA,
      type: albumType,
      artist: artist._id,
    };
    onFormSubmit({
      album: updatedAlbum,
      artist
    });
	}

  function onAlbumTypeChange(albumType: AlbumTypes): void {
    setAlbumType(albumType);
  }

  function onAlbumFromVAChange(isAlbumFromVA: boolean): void {
    setAlbumFromVA(isAlbumFromVA);
  }

  return (
		<div className="edit-album">
      <h2>
        <span>{t('library.editAlbum.title')}</span>
        <pre className="folder-name">
          <code>{path}</code>
        </pre>
      </h2>
      <AlbumForm
        album={album}
        artist={artist}
        albumType={albumType}
        isAlbumFromVA={isAlbumFromVA}
        onAlbumTypeChange={onAlbumTypeChange}
        onAlbumFromVAChange={onAlbumFromVAChange}
        onFormSubmit={_onFormSubmit}/>
    </div>
	);
}
