import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import cx from 'classnames';
import { AlbumGridView } from '../LibraryView/AlbumGridView/AlbumGridView';
import './ArtistView.scss';

import { openContextMenu } from '../../lib/contextMenu';
import actionsMap from '../../actions/actions';

import {
  getDefaultArtist,
  getArtistReleases,
  selectors as librarySelectors
} from '../../store/modules/library';
import { Album, getAlbumsByArtist } from '../../store/modules/album';
import { updateTitle } from '../../store/modules/ui';
import { ApplicationState } from '../../store/store';
import { formatArtistName } from '../../utils/artistUtils';
import { LIBRARY } from '../../routes';

import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionsGroups,
  AlbumActions
} from '../../actions/albumActions';

import {
  LIBRARY_CONTENT_CONTEXT_ACTIONS,
  LibraryContentActionGroups
} from '../../actions/libraryContentActions';

export const ArtistView = (): ReactElement => {
  const dispatch = useDispatch();
  const { name: nameFromURL } = useParams();
  const {
    artist,
    albums,
    currentAlbumId
  } = useSelector((state: ApplicationState) => {
    const artist = librarySelectors.findArtistById(state, nameFromURL)
      || getDefaultArtist();
    const albums = artist._id ? getAlbumsByArtist(state, artist._id) : {};
    return {
      artist,
      albums,
      currentAlbumId: state.player.currentAlbumId
    };
  });

  const { _id, name } = artist;

  useEffect(() => {
    dispatch(updateTitle(`Artist: ${formatArtistName(name)}`));
    dispatch(getArtistReleases(artist));
  }, [name]);

  function onAlbumContextMenu(album: Album): void {
		openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        albums: [album],
        dispatch,
        actionGroups: [
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.ENQUEUE,
          AlbumActionsGroups.SYSTEM,
          AlbumActionsGroups.SEARCH_ONLINE
        ]
      },
      {
        type: LIBRARY_CONTENT_CONTEXT_ACTIONS,
        selection: [album],
        dispatch,
        currentAlbumId,
        actionGroups: [
          LibraryContentActionGroups.ALBUMS
        ]
      }
    ]);
	}

  function onAlbumDoubleClick(album: Album): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      albums: [album],
      queue: [album._id],
      dispatch
    }).handler();
	}

  function renderReleases(): ReactElement {
    return (
      <section className="artist-releases">
      {
        Object.entries(albums).map(([type, releases]) => {
          const sectionClassNames = cx('artist-release-group', `artist-release-group-${type}`);
          const headerClassNames = cx('header', `header-${type}`);
          return (
            <section className={sectionClassNames} key={type}>
              <h2 className={headerClassNames}>{type} <span className="release-count">({releases.length})</span></h2>
              <AlbumGridView
                albums={releases}
                currentAlbumId={currentAlbumId}
                onAlbumContextMenu={onAlbumContextMenu}
                onAlbumDoubleClick={onAlbumDoubleClick}/>
            </section>
          );
        })
      }
      </section>
    );
  }

  return (
    !_id
    ? <Redirect to={LIBRARY}/>
    : <section className="artist">
        {renderReleases()}
      </section>
  );
}
