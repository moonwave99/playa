import loggerConfig from '../../loggerConfig.json';
import pc from 'picocolors';

export function log(key: string, ...params: unknown[]) {
  if (process.env.TEST) {
    return;
  }
  const tokens = key.split(':');
  if (!(loggerConfig as Record<string, boolean>)[tokens[0]]) {
    return;
  }
  console.log(
    pc.green(key),
    ...params.map(x => {
      if (typeof x === 'string') {
        if (x.startsWith('https://')) {
          return pc.yellow(pc.underline(x));
        }
        return pc.yellow(x);
      }
      if (typeof x === 'number') {
        return pc.magenta(x);
      }
      return x;
    })
  );
}