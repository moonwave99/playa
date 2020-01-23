import React, { ReactElement, SyntheticEvent, FC, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TracklistView } from '../../AlbumListView/AlbumView/TracklistView/TracklistView';
import {
  Album,
  AlbumTypes,
  getDefaultAlbum,
  VARIOUS_ARTISTS_ID
} from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import './ImportView.scss';

type ImportViewProps = {
  tracks: Track[];
  folderToImport: string;
  onFormSubmit: Function;
}

type SelectOption = {
  value: string;
  label: string;
}

type FormFieldParams = {
  accessor: string;
  title: string;
  value?: string | number;
  type: 'text' | 'number' | 'select' | 'checkbox';
  className?: string;
  disabled?: boolean;
  required?: boolean;
  options?: SelectOption[];
  onChange?: (event: SyntheticEvent) => void;
}

export const ImportView: FC<ImportViewProps> = ({
  tracks = [],
  folderToImport,
  onFormSubmit
}) => {
  const [albumType, setAlbumType] = useState(AlbumTypes.Album);
  const [isAlbumFromVA, setAlbumFromVA] = useState(false);
  const { t } = useTranslation();
  const formRef = useRef(null);
  const formFields: FormFieldParams[] = [
    {
      accessor: 'artist',
      title: t('albums.props.artist'),
      type: 'text',
      value: tracks[0] && tracks[0].artist,
      disabled: isAlbumFromVA
    },
    {
      accessor: 'isVariousArtists',
      title: t('library.import.form.isVariousArtists'),
      type: 'checkbox',
      required: false,
      onChange: (): void => setAlbumFromVA(!isAlbumFromVA)
    },
    {
      accessor: 'title',
      title: t('albums.props.title'),
      type: 'text'
    },
    {
      accessor: 'year',
      title: t('albums.props.year'),
      type: 'number'
    },
    {
      accessor: 'type',
      title: t('albums.props.type'),
      type: 'select',
      onChange: (event: SyntheticEvent): void => {
        const target = event.target as HTMLSelectElement;
        setAlbumType(
          target[target.selectedIndex].getAttribute('value') as AlbumTypes
        );
      },
      options: Object.values(AlbumTypes).map(x => ({ value: x, label: x }))
    }
  ];

  const _onFormSubmit = (event: SyntheticEvent): void => {
		event.preventDefault();
    const formData = new FormData(formRef.current);
    const {
      artist,
      title,
      year,
      type
    } = formFields.reduce((memo, { accessor }) => ({
      ...memo,
      [accessor]: formData.get(accessor)
    }), {}) as Album;
    const album = {
      ...getDefaultAlbum(),
      artist: isAlbumFromVA ? VARIOUS_ARTISTS_ID : artist,
      title,
      year,
      type,
      path: folderToImport,
      tracks: tracks.map(({ _id }) => _id)
    };
		onFormSubmit(album, tracks);
	};

  function renderFormField({
    accessor,
    title,
    type,
    className,
    value,
    required = true,
    disabled = false,
    options,
    onChange
  }: FormFieldParams): ReactElement {
    switch (type) {
      case 'text':
      case 'number':
        return (
          <p className={`form-field ${className || accessor}`} key={accessor}>
            <label htmlFor={accessor}>{title}</label>
            <input
              onChange={onChange}
              required={required}
              disabled={disabled}
              defaultValue={value}
              name={accessor}
              type={type}
              id={accessor}
              data-key-catch="Space"/>
          </p>
        );
      case 'checkbox':
      return (
        <p className={`form-field ${className || accessor}`} key={accessor}>
          <label htmlFor={accessor}>
            <input
              onChange={onChange}
              required={required}
              disabled={disabled}
              defaultValue={value}
              name={accessor}
              type={type}
              id={accessor}
              data-key-catch="Space"/>
            {title}
          </label>
        </p>
      );
      case 'select':
        return (
          <p className={`form-field ${className || accessor}`} key={accessor}>
            <label htmlFor={accessor}>{title}</label>
            <select
              onChange={onChange}
              required={required}
              name={accessor}
              id={accessor}
              data-key-catch="Space">
              {options.map(({ value, label }) => <option value={value} key={value}>{label}</option>)}
            </select>
          </p>
        );
    }
  }

  function renderForm(): ReactElement {
    return (
      <form
        className="import-form"
        ref={formRef}
        onSubmit={_onFormSubmit}>
        {formFields.map(renderFormField)}
        <p className="button-wrapper">
          <button type="submit" className="button">{t('library.import.form.submit')}</button>
        </p>
      </form>
    );
  }

  return (
		<div className="import-view">
      <h2>
        <span>{t('library.import.title')}</span>
        <pre className="folder-name">
          <code>{folderToImport}</code>
        </pre>
      </h2>
      {renderForm()}
      <TracklistView
        className="not-playable"
        rawTracks={tracks.map(({ path }) => path)}
        showArtists={isAlbumFromVA}
        showTrackNumbers={albumType !== AlbumTypes.Remix}
        tracklist={tracks}/>
    </div>
	);
}
