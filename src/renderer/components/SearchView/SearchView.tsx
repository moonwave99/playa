import React, { useState, FC } from 'react';
import { ipcRenderer } from 'electron';
import { Album } from '../../../interfaces';
import { SearchBar } from '../SearchBar/SearchBar';
import { ResultList } from '../ResultList/ResultList';
import './SearchView.scss';

type SearchViewProps = {

};

export const SearchView: FC<SearchViewProps> = () => {
  const [results, setResults] = useState<Array<Album>>([]);
  const [searched, setSearched] = useState(false);

  const onFormSubmit = async (value: string): Promise<void> => {
    setResults(await ipcRenderer.invoke('db-search', value));
    setSearched(true);
  };

	return (
    <div className="search-view">
      <div className="searchbar-wrapper">
        <SearchBar onFormSubmit={onFormSubmit} />
      </div>
      <div className="results-wrapper">
        <ResultList results={results} searched={searched}/>
      </div>
    </div>
	);
}
