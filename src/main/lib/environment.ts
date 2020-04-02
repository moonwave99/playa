export enum Environment {
  prod = 'prod',
  dev = 'dev',
  fresh = 'fresh'
}

export type EnvironmentValues = {
  disableDiscogsRequests: boolean;
  debug: boolean;
  backupProduction: boolean;
  environment: Environment;
  isRunningInSpectron: boolean;
}

function getEnvironment(env = 'prod'): Environment {
  switch (env) {
    case 'prod':
      return Environment.prod;
    case 'dev':
      return Environment.dev;
    case 'fresh':
      return Environment.fresh;
    default:
      throw new Error(`Environment not supported: ${env}`);
  }
}

export function parseEnvironment(env: NodeJS.ProcessEnv): EnvironmentValues {
  return {
    disableDiscogsRequests: env.DISABLE_DISCOGS_REQUESTS === 'true',
    debug: env.DEBUG === 'true',
    backupProduction: env.BACKUP_PRODUCTION === 'true',
    environment: getEnvironment(env.ENV),
    isRunningInSpectron: !!env.RUNNING_IN_SPECTRON
  };
}
