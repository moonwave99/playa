import React, { ReactElement, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { SearchResultList } from './SearchResultList/SearchResultList';
import { updateTitle } from '../../store/modules/ui';
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
  const location = useLocation();
  const dispatch = useDispatch();
  const currentAlbumId = useSelector(({ player }) => player.currentAlbumId);
  const {
    results,
    isSearching,
  } = useSelector(searchSelector);

  const q = new URLSearchParams(location.search);
  const query = q.get('query');

  useEffect(() => {
    if (isSearching) {
      dispatch(updateTitle('searching...'));
      return;
    }
    const title = query
      ? `search: ${results.length} results for ${query}`
      : 'search';
    dispatch(updateTitle(title));
  }, [results, query]);

  useEffect(() => {
    if (query) {
      dispatch(searchRequest(query));
    }
  }, [query]);

  function onResultContextMenu(album: Album): void {
    openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        album,
        queue: [album._id],
        dispatch,
        actionGroups: [
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.ENQUEUE,
          AlbumActionsGroups.SYSTEM,
          AlbumActionsGroups.SEARCH_ONLINE
        ]
      }
    ]);
  }

  function onResultDoubleClick(album: Album): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      album,
      queue: [album._id],
      dispatch
    }).handler();
  }

	return (
    <div className="search-view">
      <h1>Results for: <span className="highlight">{query}</span></h1>
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
            onResultContextMenu={onResultContextMenu}
            onResultDoubleClick={onResultDoubleClick}/>
        </CSSTransition>
      </div>
    </div>
	);
}
