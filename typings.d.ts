declare module 'pouchdb-quick-search';
declare module 'disconnect';
declare module 'sha1';
declare module 'browser-id3-writer';

declare function emit (val: string|number): void;
declare function emit (key: string|number, value: string|number): void;

declare namespace NodeJS {
  export interface ProcessEnv {
    DISABLE_DISCOGS_REQUESTS: string;
    DEBUG: string;
    ENV: string;
    RUNNING_IN_SPECTRON: string;
    BACKUP_PRODUCTION: string;
    LOG_LEVEL: string;
  }
}
