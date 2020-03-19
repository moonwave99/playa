import React, { ReactElement, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SearchResultList } from './SearchResultList/SearchResultList';
import { ApplicationState } from '../../store/store';
import { updateTitle } from '../../store/modules/ui';
import { Artist } from '../../store/modules/artist';
import { Album } from '../../store/modules/album';
import { searchSelector, searchRequest } from '../../store/modules/search';
import { openContextMenu } from '../../lib/contextMenu';
import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionsGroups,
  AlbumActions
} from '../../actions/albumActions';

import actionsMap from '../../actions/actions';
import './SearchView.scss';

export const SearchView = (): ReactElement => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentAlbumId = useSelector(({ player }: ApplicationState) => player.currentAlbumId);
  const {
    results,
    isSearching,
  } = useSelector(searchSelector);

  const q = new URLSearchParams(location.search);
  const query = q.get('query');

  useEffect(() => {
    if (isSearching) {
      dispatch(updateTitle(t('search.searching')));
      return;
    }
    const title = query
      ? t('search.results', { count: results.length, query })
      : t('search.title');
    dispatch(updateTitle(title));
  }, [results, query]);

  useEffect(() => {
    if (query) {
      dispatch(searchRequest(query));
    }
  }, [query]);

  function onContextMenu(albumIDs: Album['_id'][], artist?: Artist): void {
    if (albumIDs.length === 1) {
      const album = results.find(({ _id }) => _id === albumIDs[0]);
      openContextMenu([
        {
          type: ALBUM_CONTEXT_ACTIONS,
          albums: [{ album, artist }],
          queue: [albumIDs[0]],
          dispatch,
          actionGroups: [
            AlbumActionsGroups.PLAYBACK,
            AlbumActionsGroups.ENQUEUE,
            AlbumActionsGroups.SYSTEM,
            AlbumActionsGroups.SEARCH_ONLINE
          ]
        }
      ]);
    } else {
      const albums = albumIDs.map(
        id => results.find(({ _id }) => _id === id)
      );
      openContextMenu([
        {
          type: ALBUM_CONTEXT_ACTIONS,
          albums: albums.map(album => ({ album, artist })),
          queue: albumIDs,
          dispatch,
          actionGroups: [
            AlbumActionsGroups.ENQUEUE
          ]
        }
      ]);
    }
  }

  function onResultDoubleClick(album: Album, artist: Artist): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      albums: [{ album, artist }],
      queue: [album._id],
      dispatch
    }).handler();
  }

  function onResultEnter(album: Album): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      albums: [{ album, artist: {} as Artist }],
      queue: [album._id],
      dispatch
    }).handler();
  }

	return (
    <div className="search-view">
      <div className="results-wrapper">
        <CSSTransition
          in={!isSearching}
          timeout={300}
          classNames="search-result-list"
          unmountOnExit>
          <SearchResultList
            results={results}
            query={query}
            isSearching={isSearching}
            currentAlbumId={currentAlbumId}
            onContextMenu={onContextMenu}
            onResultEnter={onResultEnter}
            onResultDoubleClick={onResultDoubleClick}/>
        </CSSTransition>
      </div>
    </div>
	);
}
