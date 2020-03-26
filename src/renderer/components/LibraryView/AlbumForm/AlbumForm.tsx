import React, { ReactElement, ChangeEvent, FormEvent, KeyboardEvent, FC, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Autosuggest from 'react-autosuggest';
import { Form, Field } from 'react-final-form';
import cx from 'classnames';
import {
  Album,
  AlbumTypes
} from '../../../store/modules/album';

import { ApplicationState } from '../../../store/store';
import {
  Artist,
  getDefaultArtist,
  searchArtists,
} from '../../../store/modules/artist';

import './AlbumForm.scss';

type AlbumFormProps = {
  album: Album;
  artist?: Artist;
  albumType: AlbumTypes;
  isAlbumFromVA: boolean;
  className?: string;
  onFormSubmit: Function;
  onAlbumTypeChange?: Function;
  onAlbumFromVAChange?: Function;
}

export const AlbumForm: FC<AlbumFormProps> = ({
  album,
  artist: propArtist,
  albumType,
  className,
  onFormSubmit,
  isAlbumFromVA = false,
  onAlbumTypeChange,
  onAlbumFromVAChange
}) => {
  const { t } = useTranslation();
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const artistSuggestions = useSelector(
    (state: ApplicationState) => suggestionQuery === '' ? [] : searchArtists(state, suggestionQuery)
  );
  const [artist, setArtist] = useState(getDefaultArtist());
  const classNames = cx('form', 'album-form', className);

  useEffect(() => {
    if (propArtist && propArtist.name) {
      setArtist(propArtist);
    }
  }, [propArtist]);

  function _onFormSubmit({
    title,
    year
  }: { title: string; year: string }): void {
    onFormSubmit({
      year: +year,
      title,
      artist
    });
  }

  function onVariousArtistsChange(): void {
    onAlbumFromVAChange && onAlbumFromVAChange(!isAlbumFromVA);
  }

  function onTypeChange(event: ChangeEvent): void {
    const target = event.target as HTMLSelectElement;
    const selectedAlbumType = target[target.selectedIndex].getAttribute('value') as AlbumTypes;
    onAlbumTypeChange && onAlbumTypeChange(selectedAlbumType);
  }

  function renderArtistField(): ReactElement {
    function onChange(event: ChangeEvent<HTMLInputElement>): void {
      setArtist({ ...getDefaultArtist(), name: event.target.value});
    }

    function getSuggestionValue(artist: Artist): string {
      return artist._id;
    }

    async function onSuggestionsFetchRequested({ value }: { value: string }): Promise<void> {
      setSuggestionQuery(value);
    }

    function onSuggestionsClearRequested(): void {
      setSuggestionQuery('');
    }

    function onSuggestionSelected(
      _event: FormEvent,
      { suggestion }: { suggestion: Artist }
    ): void {
      setArtist(suggestion);
    }

    function renderSuggestion(artist: Artist): ReactElement {
      return <span>{artist.name}</span>;
    }

    function onKeyDown(event: KeyboardEvent): void {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          event.stopPropagation();
          break;
        case 'Escape':
          if (artistSuggestions.length > 0) {
            event.preventDefault();
            event.stopPropagation();
          }
          break;
      }
    }

    const data = {
      'data-key-catch': 'Space'
    };
    return (
      <Autosuggest
        suggestions={artistSuggestions}
        getSuggestionValue={getSuggestionValue}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        onSuggestionSelected={onSuggestionSelected}
        renderSuggestion={renderSuggestion}
        inputProps={{
          onChange,
          required: true,
          disabled: isAlbumFromVA,
          name: 'artist',
          id: 'artist',
          value: artist.name,
          onKeyDown: onKeyDown,
          ...data
        }}/>
    );
  }

  return (
    <Form
      onSubmit={_onFormSubmit}
      render={({ handleSubmit }): ReactElement => (
        <form
          className={classNames}
          onSubmit={handleSubmit}>
          <div className="form-field input-artist">
            <label htmlFor="artist">{t('albums.props.artist')}</label>
            <Field
              name="artist"
              id="artist"
              required={!isAlbumFromVA}
              data-key-catch="Space"
              render={renderArtistField}></Field>
          </div>
          <div className="form-field input-isVariousArtists">
            <label htmlFor="isVariousArtists">
              <Field
                name="isVariousArtists"
                id="isVariousArtists"
                component="input"
                type="checkbox"
                value={isAlbumFromVA}
                onChange={onVariousArtistsChange}
                defaultValue={album.isAlbumFromVA}
                data-key-catch="Space"
                checked={isAlbumFromVA}/>
                <span>{t('library.importAlbum.form.isVariousArtists')}</span>
            </label>
          </div>
          <div className="form-field input-title">
            <label htmlFor="title">{t('albums.props.title')}</label>
            <Field
              name="title"
              id="title"
              component="input"
              type="text"
              defaultValue={album.title}
              required
              data-key-catch="Space"/>
          </div>
          <div className="form-field input-year">
            <label htmlFor="year">{t('albums.props.year')}</label>
            <Field
              name="year"
              id="year"
              component="input"
              type="number"
              defaultValue={album.year}
              required
              data-key-catch="Space"/>
          </div>
          <div className="form-field input-type">
            <label htmlFor="type">{t('albums.props.type')}</label>
            <Field
              onChange={onTypeChange}
              name="type"
              id="type"
              component="select"
              required
              defaultValue={albumType}
              data-key-catch="Space">
              {Object.values(AlbumTypes).map(
                type => <option value={type} key={type}>{type}</option>
              )}
            </Field>
          </div>
          <p className="button-wrapper">
            <button type="submit" className="button button-full">
              {t('library.importAlbum.form.submit')}
            </button>
          </p>
        </form>
      )}
    />
  );
}
