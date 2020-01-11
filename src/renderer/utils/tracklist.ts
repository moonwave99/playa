export function formatTrackNumber(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatDuration(seconds: number): string {
  const format = (val: number): string => `0${Math.floor(val)}`.slice(-2);
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;
  return (hours >= 1 ? [hours, minutes, seconds % 60] : [minutes, seconds % 60])
    .map(format).join(':');
}
