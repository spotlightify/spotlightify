// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';

const electronHandler = {
  setNumberOfSuggestions: (length: number) => {
    const adjustedLength = Math.max(0, Math.min(length, 8));
    ipcRenderer.send('set-number-of-suggestions', adjustedLength);
  },
  minizeWindow: () => {
    ipcRenderer.send('minimize-window');
  },
};

const dbHandler = {
  querySongs: (input: string) => ipcRenderer.invoke('query-songs', input),
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('database', dbHandler);

export type ElectronHandler = typeof electronHandler;
export type DbHandler = typeof dbHandler;
