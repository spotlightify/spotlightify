import { DbHandler, ElectronHandler } from '../main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    database: DbHandler;
  }
}

export {};
