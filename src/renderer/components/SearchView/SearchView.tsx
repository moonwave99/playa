import React, { useState, FC } from 'react';
import { CSSTransition } from 'react-transition-group';
import { ipcRenderer } from 'electron';
import { Album } from '../../store/modules/album';
import { SearchBar } from './SearchBar/SearchBar';
import { ResultList } from '../ResultList/ResultList';
import './SearchView.scss';

type SearchViewProps = {

};

export const SearchView: FC<SearchViewProps> = () => {
  const [results, setResults] = useState<Array<Album>>([]);
  const [searched, setSearched] = useState(false);

  const onFormSubmit = async (value: string): Promise<void> => {
    setResults(await ipcRenderer.invoke('album:search', value));
    setSearched(true);
  };

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
        <ResultList results={results} searched={searched}/>
      </CSSTransition>
      </div>
    </div>
	);
}
