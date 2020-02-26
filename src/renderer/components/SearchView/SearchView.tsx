import React, { ReactElement, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { SearchResultList } from './SearchResultList/SearchResultList';
import { ApplicationState } from '../../store/store';
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
  const currentAlbumId = useSelector(({ player }: ApplicationState) => player.currentAlbumId);
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

  function onContextMenu(albumIDs: Album['_id'][]): void {
    if (albumIDs.length === 1) {
      const album = results.find(({ _id }) => _id === albumIDs[0]);
      openContextMenu([
        {
          type: ALBUM_CONTEXT_ACTIONS,
          albums: [album],
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
          albums,
          queue: albumIDs,
          dispatch,
          actionGroups: [
            AlbumActionsGroups.ENQUEUE
          ]
        }
      ]);
    }
  }

  function onResultDoubleClick(album: Album): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      albums: [album],
      queue: [album._id],
      dispatch
    }).handler();
  }

  function onResultEnter(album: Album): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      albums: [album],
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
            onContextMenu={onContextMenu}
            onResultEnter={onResultEnter}
            onResultDoubleClick={onResultDoubleClick}/>
        </CSSTransition>
      </div>
    </div>
	);
}
