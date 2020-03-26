const SYMBOLS_TO_REPLACE = {
  '?' : '%3F',
  '#' : '%23',
  '&' : '%26',
  ':' : '%3A'
};

export function encodePath(path: string): string {
  let output = path;
  Object.entries(SYMBOLS_TO_REPLACE).forEach(
    ([symbol, replacement]) => output = output.replace(symbol, replacement)
  );
  return output;
}

export function getYearFromPath(path: string): number {
  const yearMatch = (path || '').match(/\d{4}/) || [];
  return +yearMatch[0] || undefined;
}
