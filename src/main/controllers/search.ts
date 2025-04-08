import { search } from '../db/search';

export function searchController() {
  return {
    search,
  };
}

export const actions = ['search'];