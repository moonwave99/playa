import React, { useEffect, FC } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { SearchResultList } from './SearchResultList/SearchResultList';
import { updateTitle } from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { searchRequest } from '../../store/modules/search';
import { openContextMenu } from '../../lib/contextMenu';
import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionsGroups,
  AlbumActions
} from '../../actions/albumActions';

import actionsMap from '../../actions/actions';

import './SearchView.scss';

type SearchViewProps = {

};

export const SearchView: FC<SearchViewProps> = () => {
  const {
    query,
    results,
    isSearching,
    currentAlbumId
  } = useSelector(({ search, player }) => ({...search, ...player }));

  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const title = query
      ? `search: ${results.length} results for ${query}`
      : 'search';
    dispatch(updateTitle(title));
  }, [results, query]);

  const q = new URLSearchParams(location.search);
  const queryFromURL = q.get('query');

  useEffect(() => {
    if (queryFromURL) {
      dispatch(searchRequest(queryFromURL));
    }
  }, [queryFromURL]);

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
