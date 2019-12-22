import React, { useState, FC } from 'react';
import { ipcRenderer } from 'electron';
import { SearchBar } from './SearchBar';
import { ResultList } from './ResultList';
import { Album } from '../../interfaces';

export const Main: FC = () => {
  const [results, setResults] = useState<Array<Album>>([]);
  const [searched, setSearched] = useState(false);

  const onFormSubmit = async (value: string): Promise<void> => {
    setResults(await ipcRenderer.invoke('db-search', value));
    setSearched(true);
  };

  return (
    <main>
      <SearchBar onFormSubmit={onFormSubmit} />
      <ResultList results={results} searched={searched}/>
    </main>
  );
}
