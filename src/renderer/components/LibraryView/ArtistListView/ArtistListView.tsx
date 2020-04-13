import React, { FC, ReactElement, SyntheticEvent } from 'react';
import { useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import cx from 'classnames';
import { ArtistGridView } from '../ArtistGridView/ArtistGridView';

import './ArtistListView.scss';

import {
  selectors as artistSelectors,
  VARIOUS_ARTISTS_ID
} from '../../../store/modules/artist';

import { ApplicationState } from '../../../store/store';
import { ARTIST_SHOW } from '../../../routes';
import { ALPHABET } from '../../../utils/artistUtils';

const alphabetWidth = `${ALPHABET.length * 3.2}rem`;

type ArtistListViewProps = {
  selectedLetter: string;
  onLetterClick: Function;
  onContextMenu: Function;
}

export const ArtistListView: FC<ArtistListViewProps> = ({
  selectedLetter,
  onLetterClick,
  onContextMenu
}) => {
  const artists = useSelector(
    (state: ApplicationState) => artistSelectors.findByLetter(state, selectedLetter)
  );

  function renderLetter(letter: string): ReactElement {
    function onClick(event: SyntheticEvent): void {
      event.preventDefault();
      onLetterClick(letter);
    }

    const classNames = cx(`letter-${letter}`, { selected : letter === selectedLetter })
    return (
      <li key={letter} className={classNames}>
        <a href="#" onClick={onClick}>{letter}</a>
      </li>
    );
  }

  return (
    <section className="artist-list">
      <div className="alphabet-wrapper">
        <ul className="alphabet" style={{ width: alphabetWidth }}>
          {ALPHABET.map(renderLetter)}
          <li>
            <Link
              to={generatePath(ARTIST_SHOW, { _id: VARIOUS_ARTISTS_ID })}>
              {VARIOUS_ARTISTS_ID}
            </Link>
          </li>
        </ul>
      </div>
      <ArtistGridView artists={artists} onContextMenu={onContextMenu}/>
    </section>
  );
}
