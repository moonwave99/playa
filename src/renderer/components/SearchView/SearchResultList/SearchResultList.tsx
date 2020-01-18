import React, { ReactElement } from 'react';
import { SearchResultListItem } from './SearchResultListItem/SearchResultListItem';
import { Album } from '../../../store/modules/album';
import './SearchResultList.scss';

type SearchResultListProps = {
  results: Array<Album>;
  query: string;
  isSearching: boolean;
  onContextMenu: Function;
};

export const SearchResultList: React.FC<SearchResultListProps> = ({
  results,
  query,
  isSearching,
  onContextMenu
}) => {
  function _onContextMenu(album: Album): void {
    onContextMenu(album);
  }

  function renderEmptyComponent(query: string): ReactElement {
    return (
      <li className="search-result-list-empty-component">
        No results for <span className="highlight">{query}</span>.
      </li>
    );
  }

  return (
    isSearching ? null :
      <ul className="search-result-list">{
        results.length > 0
          ? results.map(
            (result: Album) =>
              <SearchResultListItem
                result={result}
                key={result._id}
                onContextMenu={_onContextMenu}/>
          )
          : renderEmptyComponent(query)
      }</ul>
  );
}
