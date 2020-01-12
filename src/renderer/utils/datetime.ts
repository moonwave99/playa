export function formatDuration(seconds: number): string {
  const format = (val: number): string => `0${Math.floor(val)}`.slice(-2);
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;
  return (hours >= 1 ? [hours, minutes, seconds % 60] : [minutes, seconds % 60])
    .map(format).join(':');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}
