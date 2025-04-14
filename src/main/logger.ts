import logConfig from '../../logConfig.json';

export function log(key: string, ...params: unknown[]) {
  if (process.env.TEST) {
    return;
  }
  const tokens = key.split(':');
  if (!(logConfig as Record<string, boolean>)[tokens[0]]) {
    return;
  }
  console.log(key, ...params);
}