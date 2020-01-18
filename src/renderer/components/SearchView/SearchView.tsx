import React, { useEffect, FC } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { SearchBar } from './SearchBar/SearchBar';
import { SearchResultList } from './SearchResultList/SearchResultList';
import { ApplicationState } from '../../store/store';
import { updateTitle, showContextMenu } from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { searchRequest } from '../../store/modules/search';
import { ContextMenuTypes } from '../../utils/contextMenuUtils';
import './SearchView.scss';

type SearchViewProps = {

};

export const SearchView: FC<SearchViewProps> = () => {
  const {
    query,
    results,
    isSearching
  } = useSelector(({ search }: ApplicationState) => search);
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

  function onContextMenu(album: Album): void {
    dispatch(showContextMenu({
      type: ContextMenuTypes.RESULT_LIST_ITEM,
      context: album
    }));
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
            onContextMenu={onContextMenu}/>
        </CSSTransition>
      </div>
    </div>
	);
}
