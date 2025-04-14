import loggerConfig from '../../loggerConfig.json';

export function log(key: string, ...params: unknown[]) {
  if (process.env.TEST) {
    return;
  }
  const tokens = key.split(':');
  if (!(loggerConfig as Record<string, boolean>)[tokens[0]]) {
    return;
  }
  console.log(key, ...params);
}