export function encodePath(path: string): string {
  return path.replace('?', '%3F');
}
