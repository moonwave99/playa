import React, { ReactElement, SyntheticEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { ArtistListItemView} from './ArtistListItemView/ArtistListItemView';

import './ArtistListView.scss';

import { Artist } from '../../../store/modules/library';
import { ApplicationState } from '../../../store/store';

import { ALPHABET, VARIOUS_ARTISTS_ID } from '../../../utils/artistUtils';

const DEFAULT_LETTER = 'a';

export const ArtistListView = (): ReactElement => {
  const { t } = useTranslation();
  const [selectedLetter, setSelectedLetter] = useState(DEFAULT_LETTER);

  const artists = useSelector(({ library }: ApplicationState) => {
    return Object.values(library.artistsById).filter(({ name }) => {
      return (selectedLetter === 'V/A' && name === VARIOUS_ARTISTS_ID)
        || (selectedLetter.match(/[a-z]/) && name.charAt(0).toLowerCase() === selectedLetter)
        || (!name.charAt(0).toLowerCase().match(/[a-z]/) && name !== VARIOUS_ARTISTS_ID && selectedLetter === '#');
    });
  });

  function renderLetter(letter: string): ReactElement {
    function onClick(event: SyntheticEvent): void {
      event.preventDefault();
      setSelectedLetter(letter);
    }

    const classNames = cx(`letter-${letter}`, { 'selected' : letter === selectedLetter })
    return (
      <li key={letter} className={classNames}>
        <a href="#" onClick={onClick}>{letter}</a>
      </li>
    );
  }

  function renderArtist(artist: Artist): ReactElement {
    const { _id } = artist;
    return (
      <li key={_id}>
        <ArtistListItemView artist={artist}/>
      </li>
    );
  }

  return (
    <section className="library-artists">
      <h2>{t('library.artists.title')}</h2>
      <ul className="alphabet">
        {ALPHABET.map(renderLetter)}
      </ul>
      <ul className="artist-list">
        {artists.map(renderArtist)}
      </ul>
    </section>
  );
}
