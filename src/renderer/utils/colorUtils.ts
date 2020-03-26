export function getHashCode(name: string): number {
  let hash = 0;
  if (name.length === 0) {
    return hash;
  }
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return hash;
}

export function intToHSL(n: number, saturation = 20, lightness = 20): string {
  return `hsl(${n % 360}, ${saturation}%, ${lightness}%)`;
}
