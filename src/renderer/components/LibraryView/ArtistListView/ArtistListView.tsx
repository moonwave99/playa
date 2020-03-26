import React, { FC, ReactElement, SyntheticEvent } from 'react';
import { useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import cx from 'classnames';
import { ArtistListItemView } from './ArtistListItemView/ArtistListItemView';

import './ArtistListView.scss';

import {
  Artist,
  selectors as artistSelectors,
  VARIOUS_ARTISTS_ID
} from '../../../store/modules/artist';

import { ApplicationState } from '../../../store/store';
import { ARTIST_SHOW } from '../../../routes';
import { ALPHABET } from '../../../utils/artistUtils';

type ArtistListViewProps = {
  selectedLetter: string;
  onLetterClick: Function;
}

export const ArtistListView: FC<ArtistListViewProps> = ({
  selectedLetter,
  onLetterClick
}) => {
  const artists = useSelector(
    (state: ApplicationState) => artistSelectors.findByLetter(state, selectedLetter)
  );

  function renderLetter(letter: string): ReactElement {
    function onClick(event: SyntheticEvent): void {
      event.preventDefault();
      onLetterClick(letter);
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

  const classNames = cx('library-artists');

  return (
    <section className={classNames}>
      <div className="artists-start"></div>
      <ul className="alphabet">
        {ALPHABET.map(renderLetter)}
        <li>
          <Link
            to={generatePath(ARTIST_SHOW, { _id: VARIOUS_ARTISTS_ID })}>
            {VARIOUS_ARTISTS_ID}
          </Link>
        </li>
      </ul>
      <ul className="artist-list">
        {artists.map(renderArtist)}
      </ul>
    </section>
  );
}
