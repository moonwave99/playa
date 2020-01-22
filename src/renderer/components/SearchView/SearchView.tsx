import React, { useEffect, FC } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { SearchBar } from './SearchBar/SearchBar';
import { SearchResultList } from './SearchResultList/SearchResultList';
import { ApplicationState } from '../../store/store';
import { updateTitle } from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { searchRequest } from '../../store/modules/search';
import { playTrack, updateQueue } from '../../store/modules/player';
import { openContextMenu } from '../../lib/contextMenu/contextMenu';
import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionItems
} from '../../lib/contextMenu/actions/album';
import './SearchView.scss';

type SearchViewProps = {

};

export const SearchView: FC<SearchViewProps> = () => {
  const {
    query,
    results,
    isSearching,
    currentAlbumId
  } = useSelector(({ search, player }: ApplicationState) => ({...search, ...player }));
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    const title = query
      ? `search: ${results.length} results for ${query}`
      : 'search';
    dispatch(updateTitle(title));
  }, [results, query]);

  useEffect(() => {
    const q = new URLSearchParams(history.location.search);
    const queryFromURL = q.get('query');
    if (queryFromURL) {
      dispatch(searchRequest(queryFromURL));
    }
  }, []);

  const onFormSubmit = (query: string): void => {
    dispatch(searchRequest(query));
  };

  function onResultContextMenu(album: Album): void {
    openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        album,
        dispatch,
        actions: [
          AlbumActionItems.PLAYBACK,
          AlbumActionItems.ENQUEUE,
          AlbumActionItems.SYSTEM,
          AlbumActionItems.SEARCH_ONLINE
        ]
      }
    ]);
  }

  function onResultDoubleClick({ _id: albumId }: Album): void {
    dispatch(updateQueue([albumId]));
    dispatch(playTrack({ albumId }));
  }

	return (
    <div className="search-view">
      <div className="searchbar-wrapper">
        <SearchBar onFormSubmit={onFormSubmit} />
      </div>
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
