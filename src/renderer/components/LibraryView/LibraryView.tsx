import React, { FC, ReactElement, useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useScroll from '../../hooks/useScroll/useScroll';
import { getLatestRequest } from '../../store/modules/library';
import { LatestAlbumsView } from './LatestAlbumsView/LatestAlbumsView';
import { ArtistListView } from './ArtistListView/ArtistListView';

import { ApplicationState } from '../../store/store';
import { UILibraryView, updateTitle } from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { Track } from '../../store/modules/track';
import { openContextMenu } from '../../lib/contextMenu';

import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionsGroups,
  AlbumActions
} from '../../actions/albumActions';

import {
  ARTIST_CONTEXT_ACTIONS,
  ArtistActionsGroups
} from '../../actions/artistActions';

import {
  LIBRARY_CONTENT_CONTEXT_ACTIONS,
  LibraryContentActionGroups,
  LibraryContentActions
} from '../../actions/libraryContentActions';

import actionsMap from '../../actions/actions';

import { LIBRARY_LATEST_ALBUM_LIMIT } from '../../../constants';

import {
  LIBRARY
} from '../../routes';

import './LibraryView.scss';

const DEFAULT_LETTER = 'a';

type LibraryViewProps = {
	onDrop: Function;
	onScroll: (scrolling: boolean) => void;
};

export const LibraryView: FC<LibraryViewProps> = ({
  onDrop,
  onScroll
}) => {
  const { t } = useTranslation();
	const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const { ref } = useScroll(onScroll);

  const [selectedLetter, setSelectedLetter] = useState(DEFAULT_LETTER);

  const q = new URLSearchParams(location.search);
  const letter = q.get('letter');

  useEffect(() => {
    if (letter) {
      setSelectedLetter(letter);
    }
  }, [letter]);

	const {
    latest,
    libraryView,
    currentAlbumId,
    currentTrackId
  } = useSelector(({ albums, library, player, ui }: ApplicationState) => ({
    latest: library.latest
      ? library.latest
        .map((_id: Album['_id']) => albums.allById[_id])
        .filter(a => !!a)
      : null,
    libraryView: ui.libraryView,
    ...player
  }));

	useEffect(() => {
		dispatch(
			getLatestRequest(
				new Date().toISOString(),
				LIBRARY_LATEST_ALBUM_LIMIT
			)
		);
	}, []);

	useEffect(() => {
    dispatch(updateTitle({
      main: t('library.title')
    }));
  }, []);

	function onAlbumContextMenu({
    album,
    artist,
    selection
  }: {
    album: Album;
    artist: Artist;
    selection: Album['_id'][];
  }): void {
    const menuSelection = [
      album,
      ...selection
        .filter(_id => _id !== album._id)
        .map(_id => ({ _id }))
    ] as Album[];

		openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        selection: menuSelection,
        artist,
        dispatch,
        actionGroups: [
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.ENQUEUE,
          AlbumActionsGroups.EDIT,
          AlbumActionsGroups.SYSTEM,
          AlbumActionsGroups.SEARCH_ONLINE
        ]
      },
      {
        type: LIBRARY_CONTENT_CONTEXT_ACTIONS,
        selection,
        dispatch,
        currentAlbumId,
        actionGroups: [
          LibraryContentActionGroups.ALBUMS
        ]
      }
    ]);
	}

	function onAlbumDoubleClick({
    album,
    track
  }: {
    album: Album;
    track: Track;
  }): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      selection: [album],
      queue: [album._id],
      trackId: track ? track._id : null,
      dispatch
    }).handler();
	}

  function onAlbumEnter(selection: Album['_id'][]): void {
    if (selection.length !== 1) {
      return;
    }
    actionsMap(AlbumActions.PLAY_ALBUM)({
      selection: [{ _id: selection[0]} ] as Album[],
      queue: selection,
      dispatch
    }).handler();
  }

  function onAlbumBackspace(selection: Album['_id'][]): void {
    actionsMap(LibraryContentActions.REMOVE_ALBUMS)({
      selection,
      currentAlbumId,
      dispatch
    }).handler();
  }

  function onArtistContextMenu(artist: Artist): void {
    openContextMenu([
      {
        type: ARTIST_CONTEXT_ACTIONS,
        artist,
        actionGroups: [
          ArtistActionsGroups.SEARCH_ONLINE
        ]
      }
    ]);
  }

  function onLetterClick(letter: string): void {
    setSelectedLetter(letter);
    history.replace(
      `${LIBRARY}?letter=${letter}`
    );
  }

  function renderTimeline(): ReactElement {
    return (
      <LatestAlbumsView
        albums={latest}
        currentAlbumId={currentAlbumId}
        currentTrackId={currentTrackId}
        onAlbumEnter={onAlbumEnter}
        onAlbumBackspace={onAlbumBackspace}
        onAlbumContextMenu={onAlbumContextMenu}
        onAlbumDoubleClick={onAlbumDoubleClick}
        onDrop={onDrop}/>
    );
  }

  function renderArtists(): ReactElement {
    return (
      <ArtistListView
        selectedLetter={selectedLetter}
        onContextMenu={onArtistContextMenu}
        onLetterClick={onLetterClick}/>
    );
  }

	return (
		<section className="library" ref={ref}>
      { libraryView === UILibraryView.Artists && renderArtists() }
      { libraryView === UILibraryView.Timeline && renderTimeline() }
		</section>
	);
}
