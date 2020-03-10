import React, { ReactElement, useEffect, SyntheticEvent } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getArtists, Artist } from '../../store/modules/library';
import { updateTitle } from '../../store/modules/ui';
import { VARIOUS_ARTISTS_ID } from '../../store/modules/album';
import { ApplicationState } from '../../store/store';

import './ArtistsView.scss';

import { SEARCH } from '../../routes';

// #TODO
// 1. artist grouper / formatter helper
// 2. alphabet header
// 3. single letter section
// 4. arrange by column
// 5. horizontal overflow on long letters (A, S, T)
// 6. define loading behaviour
// see: https://ui-patterns.com/users/1/collections/alphabetic-listing_1/screenshots/3274

function groupArtistsByInitial(artists: Artist[]): { letter: string; artists: Artist[] }[] {
  return artists.reduce((memo, { name, count }) => {
    let letter: string;
    const initial = name.charAt(0).toLowerCase();
    if (name === VARIOUS_ARTISTS_ID) {
      letter = '_V/A';
    } else if (initial.match(/[a-z]/)) {
      letter = initial;
    } else {
      letter = '_symbol';
    }
    const letterEntry = memo.find(
      ({ letter: _letter }: { letter: string }) => letter === _letter
    );
    if (!letterEntry) {
      memo.push({
        letter,
        artists: [{ name, count }]
      });
    } else {
      letterEntry.artists.push({ name, count })
    }
    return memo;
  }, []);
}

export const ArtistsView = (): ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const artistsByLetter = useSelector(
    ({ library }: ApplicationState) => groupArtistsByInitial(library.artists)
  );

  useEffect(() => {
    dispatch(updateTitle('library:artists'));
  }, []);

  useEffect(() => {
    dispatch(getArtists());
  }, [artistsByLetter.length]);

  function formatLetter(letter: string): string {
    switch (letter) {
      case '_symbol':
        return '#';
      case '_V/A':
        return 'V/A';
      default:
        return letter.toUpperCase();
    }
  }

  function renderLetterLink(letter: string): ReactElement {
    function onClick(event: SyntheticEvent): void {
      event.preventDefault();
    }
    return <a href={`#${letter}`} onClick={onClick}>{formatLetter(letter)}</a>;
  }

  function renderArtistsHeader(): ReactElement {
    return (
      <ul className="letter-list">
        {artistsByLetter.map(({ letter }) =>
        <li key={letter}>
          {renderLetterLink(letter)}
        </li>
        )}
      </ul>
    );
  }

  function renderArtistLink(name: string): ReactElement {
    return <Link to={`${generatePath(SEARCH)}?query=artist: ${encodeURIComponent(name)}`}>{name}</Link>;
  }

  function renderLetter({ letter, artists }: { letter: string; artists: Artist[] }): ReactElement {
    return (
      <article key={letter} className="letter">
        <h2>{formatLetter(letter)} ({artists.length})</h2>
        <ul>
        {
          artists.map(({ name, count }) => <li key={name}>{renderArtistLink(name)} ({count})</li>)
        }
        </ul>
      </article>
    );
  }

  function renderArtists(): ReactElement {
    return (
      <>
        {renderArtistsHeader()}
        {artistsByLetter.map(renderLetter)}
      </>
    );
  }

	return (
		<section className="library-artists">
      <header>
        <h1>{t('library.artists.title')}</h1>
      </header>
      { artistsByLetter.length > 0
        ? renderArtists()
        : <p className="library-artists-empty-placeholder">{t('library.artists.empty')}</p>
      }
		</section>
	);
}
