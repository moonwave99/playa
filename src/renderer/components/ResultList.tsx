import React from 'react';
import { ResultListItem } from './ResultListItem';
import { Album } from '../../interfaces';

type ResultListProps = {
  results: Array<Album>;
  searched: boolean;
};

export const ResultList: React.FC<ResultListProps> = ({ results, searched }) => {
  function renderEmptyComponent(searched: boolean): React.ReactElement {
    return searched ? <li>No results.</li> : null;
  }
  return (
    <ul className="result-list">{
      results.length > 0
        ? results.map((result: Album) => <ResultListItem result={result} key={result._id} />)
        : renderEmptyComponent(searched)
    }</ul>
  );
}
