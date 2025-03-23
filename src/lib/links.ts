import { normalizeTitle } from './utils';
import type { HasId, Entities } from '@/types/types';

export function getURL(url: string, params: Record<string, string>) {
  return `${url}?${new URLSearchParams(params)}`;
}

export function getDiscogsURL(q: string, type: 'artist' | 'master') {
  return getURL('https://www.discogs.com/search', { type, q: normalizeTitle(q) });
}

const RYMMap = {
  artist: 'a',
  release: 'l'
};

export function getRYMURL(searchterm: string, type: 'artist' | 'release' = 'release') {
  return getURL('https://rateyourmusic.com/search', { searchtype: RYMMap[type], searchterm });
}

export function getCover(hash: string): string {
  return `https://raw.githubusercontent.com/moonwave99/playa-assets/main/covers/${hash}-cover.jpg`;
}

export function getCollectionLink({ id }: HasId) {
  return `/collections/${id}`;
}

export function getArtistLink({ id }: HasId) {
  return `/artists/${id}`;
}

export function getReleaseLink({ id }: HasId) {
  return `/releases/${id}`;
}

export function getRandomLink(stats: Partial<Record<Entities, number>>, entity: Entities): string {
  const count = stats[entity];
  const randomId = Math.round(Math.random() * count);
  return `/${entity}s/${randomId}`;
}