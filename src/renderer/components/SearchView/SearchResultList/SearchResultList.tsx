import React from 'react';
import { SearchResultListItem } from './SearchResultListItem/SearchResultListItem';
import { Album } from '../../../store/modules/album';
import './SearchResultList.scss';

type SearchResultListProps = {
  results: Array<Album>;
  searched: boolean;
  onContextMenu: Function;
};

export const SearchResultList: React.FC<SearchResultListProps> = ({ results, searched, onContextMenu }) => {
  function _onContextMenu(album: Album): void {
    onContextMenu(album);
  }

  function renderEmptyComponent(searched: boolean): React.ReactElement {
    return searched
      ? <li className="search-result-list-empty-component">No results.</li>
      : null;
  }

  return (
    <ul className="search-result-list">{
      results.length > 0
        ? results.map(
          (result: Album) =>
            <SearchResultListItem
              result={result}
              key={result._id}
              onContextMenu={_onContextMenu}/>
        )
        : renderEmptyComponent(searched)
    }</ul>
  );
}
