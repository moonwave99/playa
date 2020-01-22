export function formatDuration(seconds: number): string {
  const format = (val: number): string => `0${Math.floor(val)}`.slice(-2);
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;
  return (hours >= 1 ? [hours, minutes, seconds % 60] : [minutes, seconds % 60])
    .map(format).join(':');
}

type formatDateOptions = {
  date: string;
  locale?: string;
  options?: object;
}

export function formatDate({
  date,
  locale = 'en-US',
  options
}: formatDateOptions): string {
  return new Date(date).toLocaleDateString(locale, options);
}

export function daysAgo({
  date = new Date(),
  days = 1
}): string {
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
