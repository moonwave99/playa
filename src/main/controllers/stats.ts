import { getStats } from '../db/stats';

export function statsController() {
  return {
    getStats
  };
}

export const actions = ['getStats'];