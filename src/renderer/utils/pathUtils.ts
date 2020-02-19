export function encodePath(path: string): string {
  return path.replace('?', '%3F');
}

export function getYearFromPath(path: string): number {
  const yearMatch = (path || '').match(/\d{4}/) || [];
  return +yearMatch[0] || undefined;
}
