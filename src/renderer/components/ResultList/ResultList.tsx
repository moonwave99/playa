import React from 'react';
import { ResultListItem } from './ResultListItem/ResultListItem';
import { Album } from '../../store/modules/album';
import './ResultList.scss';

type ResultListProps = {
  results: Array<Album>;
  searched: boolean;
  onContextMenu: Function;
};

export const ResultList: React.FC<ResultListProps> = ({ results, searched, onContextMenu }) => {
  function renderEmptyComponent(searched: boolean): React.ReactElement {
    return searched ? <li className="result-list-empty-component">No results.</li> : null;
  }

  function _onContextMenu(album: Album): void {
    onContextMenu(album);
  }

  return (
    <ul className="result-list">{
      results.length > 0
        ? results.map(
          (result: Album) =>
            <ResultListItem
              result={result}
              key={result._id}
              onContextMenu={_onContextMenu}/>
        )
        : renderEmptyComponent(searched)
    }</ul>
  );
}
