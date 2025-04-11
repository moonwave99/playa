import { getSearchResults } from '../db/searchResult';

export function searchResultController() {
  return {
    getSearchResults,
  };
}

export const actions = ['getSearchResults'];