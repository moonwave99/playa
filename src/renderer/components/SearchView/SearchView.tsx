import React, { useState, useEffect, FC } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Album } from '../../store/modules/album';
import { SearchBar } from './SearchBar/SearchBar';
import { SearchResultList } from './SearchResultList/SearchResultList';
import { updateTitle, showContextMenu } from '../../store/modules/ui';
import { searchAlbumsRequest } from '../../store/modules/album';
import { ContextMenuTypes } from '../../utils/contextMenuUtils';
import './SearchView.scss';

type SearchViewProps = {

};

export const SearchView: FC<SearchViewProps> = () => {
  const results: Album[] = useSelector(({ albums }) => albums.searchResults);
  const history = useHistory();
  const q = new URLSearchParams(history.location.search);
  const [query, setQuery] = useState(q.get('query'));
  const dispatch = useDispatch();

  useEffect(() => {
    const title = results.length > 0 ? `search: ${results.length} results for ${query}` : 'search';
    dispatch(updateTitle(title));
  }, [results]);

  useEffect(() => {
    if (query) {
      dispatch(searchAlbumsRequest(query));  
    }
  }, []);

  const onFormSubmit = async (query: string): Promise<void> => {
    dispatch(searchAlbumsRequest(query));
    setQuery(query);
  };

  function onContextMenu(album: Album): void {
    dispatch(showContextMenu({
      type: ContextMenuTypes.RESULT_LIST_ITEM,
      context: album
    }));
  }

  const searched = query !== '';

	return (
    <div className="search-view">
      <div className="searchbar-wrapper">
        <SearchBar onFormSubmit={onFormSubmit} />
      </div>
      <div className="results-wrapper">
      <CSSTransition
        in={results.length > 0 || searched === true}
        timeout={300}
        classNames="result-list"
        unmountOnExit>
        <SearchResultList
          results={results}
          searched={searched}
          onContextMenu={onContextMenu}/>
      </CSSTransition>
      </div>
    </div>
	);
}
