import React, { FC, ReactElement, SyntheticEvent } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { ArtistListItemView} from './ArtistListItemView/ArtistListItemView';

import './ArtistListView.scss';

import { Artist, selectors as librarySelectors } from '../../../store/modules/library';
import { ApplicationState } from '../../../store/store';

import { ALPHABET } from '../../../utils/artistUtils';

type ArtistListViewProps = {
  selectedLetter: string;
  onLetterClick: Function;
}

export const ArtistListView: FC<ArtistListViewProps> = ({
  selectedLetter,
  onLetterClick
}) => {
  const { t } = useTranslation();

  const artists = useSelector(
    (state: ApplicationState) => librarySelectors.findArtistsByLetter(state, selectedLetter)
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
