import chalk from 'chalk';

const LOG_LEVEL = +process.env.LOG_LEVEL;

export enum LogLevel {
  Error,
  Warning,
  Info
}

export enum LogContext {
  Global = 'Global',
  AppState = 'AppState',
  Database = 'Database',
  Discogs = 'Discogs',
  Waveform = 'Waveform'
}

export type LogParams = {
  context?: LogContext;
  level?: LogLevel;
  message: string;
}

const CONTEXT_COLOR_MAP: { [key: string]: Function } = {
  [LogContext.Global]: chalk.blue,
  [LogContext.AppState]: chalk.yellow,
  [LogContext.Database]: chalk.blue,
  [LogContext.Discogs]: chalk.magenta,
  [LogContext.Waveform]: chalk.blue
};

const LEVEL_COLOR_MAP: { [key: string]: Function } = {
  [LogLevel.Info]: chalk.blue,
  [LogLevel.Warning]: chalk.yellow,
  [LogLevel.Error]: chalk.red,
};

function formatMessage(
  context: LogContext,
  level: LogLevel,
  message: string
): string {
  return `${CONTEXT_COLOR_MAP[context](`[${context}]`)} ${LEVEL_COLOR_MAP[level](message)}`;
}

export default function log({
  context = LogContext.Global,
  level = LogLevel.Info,
  message
}: LogParams,
  ...args: any // eslint-disable-line
): void {
  if (level <= LOG_LEVEL) {
    console.log(formatMessage(context, level, message), args.length > 0 ? args : '');
  }
}
