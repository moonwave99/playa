import { escapeRegExp }from 'lodash';

const SYMBOLS_TO_REPLACE = {
  '?' : '%3F',
  '#' : '%23',
  '&' : '%26',
  ':' : '%3A'
};

export function encodePath(path: string): string {
  return Object.entries(SYMBOLS_TO_REPLACE).reduce(
    (memo, [symbol, replacement]) => memo.replace(
      new RegExp(`${escapeRegExp(symbol)}`, 'g'), replacement
    )
  , path);
}

export function getYearFromPath(path: string): number {
  const yearMatch = (path || '').match(/\d{4}/) || [];
  return +yearMatch[0] || undefined;
}
