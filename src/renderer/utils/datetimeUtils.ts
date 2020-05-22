import { isAfter, sub } from 'date-fns';

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

export const LIBRARY_INTERVALS = {
  ONE_DAY: 'ONE_DAY',
  ONE_WEEK: 'ONE_WEEK',
  TWO_WEEKS: 'TWO_WEEKS',
  ONE_MONTH: 'ONE_MONTH',
  BEFORE: 'BEFORE'
};

export function groupByDate(date: Date): string {
  const now = Date.now();
  const oneDayAgo = sub(now, {
    days: 1
  });

  const oneWeekAgo = sub(now, {
    weeks: 1
  });

  const twoWeeksAgo = sub(now, {
    weeks: 2
  });

  const oneMonthAgo = sub(now, {
    months: 1
  });

  if (isAfter(date, oneDayAgo)) {
    return LIBRARY_INTERVALS.ONE_DAY;
  }

  if (isAfter(date, oneWeekAgo)) {
    return LIBRARY_INTERVALS.ONE_WEEK;
  }

  if (isAfter(date, twoWeeksAgo)) {
    return LIBRARY_INTERVALS.TWO_WEEKS;
  }

  if (isAfter(date, oneMonthAgo)) {
    return LIBRARY_INTERVALS.ONE_MONTH;
  }

  return LIBRARY_INTERVALS.BEFORE;
}
