import { Environment, parseEnvironment } from './environment';

describe('parseEnvironment', () => {
  it('should return the default values if no env var is passed', () => {
    const parsedEnv = parseEnvironment({} as NodeJS.ProcessEnv);
    expect(parsedEnv.environment).toBe(Environment.prod);
    expect(parsedEnv.debug).toBe(false);
    expect(parsedEnv.backupProduction).toBe(false);
    expect(parsedEnv.isRunningInSpectron).toBe(false);
    expect(parsedEnv.disableDiscogsRequests).toBe(false);
  });

  it('should parse the ENV var', () => {
    expect(parseEnvironment({
      ENV: 'prod'
    } as NodeJS.ProcessEnv).environment)
      .toBe(Environment.prod);

    expect(parseEnvironment({
      ENV: 'dev'
    } as NodeJS.ProcessEnv).environment)
      .toBe(Environment.dev);

    expect(parseEnvironment({
      ENV: 'fresh'
    } as NodeJS.ProcessEnv).environment)
      .toBe(Environment.fresh);

    expect(() => {
      parseEnvironment({
        ENV: '666'
      } as NodeJS.ProcessEnv);
    }).toThrow();
  });

  it('should parse the DEBUG var', () => {
    const parsedEnv = parseEnvironment({ DEBUG: 'true' } as NodeJS.ProcessEnv);
    expect(parsedEnv.debug).toBe(true);
  });

  it('should parse the RUNNING_IN_SPECTRON var', () => {
    const parsedEnv = parseEnvironment({ RUNNING_IN_SPECTRON: 'true' } as NodeJS.ProcessEnv);
    expect(parsedEnv.isRunningInSpectron).toBe(true);
  });

  it('should parse the BACKUP_PRODUCTION var', () => {
    const parsedEnv = parseEnvironment({ BACKUP_PRODUCTION: 'true' } as NodeJS.ProcessEnv);
    expect(parsedEnv.backupProduction).toBe(true);
  });

  it('should parse the DISABLE_DISCOGS_REQUESTS var', () => {
    const parsedEnv = parseEnvironment({ DISABLE_DISCOGS_REQUESTS: 'true' } as NodeJS.ProcessEnv);
    expect(parsedEnv.disableDiscogsRequests).toBe(true);
  });
})
