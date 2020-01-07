import React, { useState, FC } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector } from 'react-redux';
import { Album } from '../../store/modules/album';
import { SearchBar } from './SearchBar/SearchBar';
import { ResultList } from '../ResultList/ResultList';
import { showContextMenu } from '../../store/modules/ui';
import { searchAlbumsRequest } from '../../store/modules/album';
import { RESULT_LIST_ITEM } from '../../utils/contextMenu';
import './SearchView.scss';

type SearchViewProps = {

};

export const SearchView: FC<SearchViewProps> = () => {
  const results: Album[] = useSelector(({ albums }) => albums.searchResults);
  const [searched, setSearched] = useState(false);
  const dispatch = useDispatch();

  const onFormSubmit = async (query: string): Promise<void> => {
    dispatch(searchAlbumsRequest(query));
    setSearched(true);
  };

  function onContextMenu(album: Album): void {
    dispatch(showContextMenu({
      type: RESULT_LIST_ITEM,
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
        in={results.length > 0 || searched === true}
        timeout={300}
        classNames="result-list"
        unmountOnExit>
        <ResultList
          results={results}
          searched={searched}
          onContextMenu={onContextMenu}/>
      </CSSTransition>
      </div>
    </div>
	);
}
