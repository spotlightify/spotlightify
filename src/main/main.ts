/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, IpcMainEvent } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
// import MenuBuilder from './menu';
// import { AccessToken, SpotifyApi } from '@spotify/web-api-ts-sdk';
import { spawn } from 'child_process';
import { resolveHtmlPath } from './util';
import { DatabaseQuery } from './database/db';
// import authResponse from './spotify';

interface Message {
  event: string;
  payload: string;
}

const authServerOnSuccessHandler = (message: Message) => {
  const { payload } = message;
  const json = JSON.parse(payload.toString());
  if (json.status && json.status === 'Server running') {
    console.log('Received status from server:', json);
    // You can now use the JSON object as needed
  }
};

function startServer() {
  const server = spawn(
    'node',
    [
      'C:\\Users\\Peter Murphy\\Documents\\GitHub\\electron-spot\\your-project-name\\src\\main\\server.mjs',
    ],
    { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] },
  );

  server.on('error', (error) => {
    console.error('Server subprocess error:', error);
  });

  server.on('message', (message: Message) => {
    try {
      if (message.event === 'success') {
        authServerOnSuccessHandler(message);
      }
    } catch (error) {
      console.error('Error parsing JSON from server:', error);
    }
  });

  // server.on('close', (code) => {
  //   console.log(`Server subprocess exited with code ${code}`);
  // });

  // server.stderr!.on('data', (data) => {
  //   console.error(`Server subprocess stderr: ${data}`);
  // });
}

const height = 72.0;
const width = 600.0;
const suggestionHeight = 58.0;

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: true,
    width,
    height,
    hasShadow: true,
    frame: false,
    transparent: true,
    icon: getAssetPath('icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const setNumberOfSuggestionsHandler = (event: IpcMainEvent, length: number) => {
  const adjustedLength = Math.max(0, Math.min(length, 8));
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  if (!win) {
    return;
  }

  const { x, y } = win.getBounds();
  const windowSize = {
    width,
    height: height + adjustedLength * suggestionHeight,
    x: Math.round(x + 0.88),
    y: Math.round(y + 0.88),
  };
  win.setBounds(windowSize);
};

const minimizeWindow = () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.minimize();
  }
};

const dbInstance = new DatabaseQuery();

ipcMain.handle('query-songs', async (event, input: string) => {
  // Assuming querySongs is a method of a class that has 'database' as a member
  return dbInstance.querySongs(input);
});

// ipcMain.handle('spotify-queue', (event, uri: string) => {
//   Spotify.queueSong(uri);
// });

app
  .whenReady()
  .then(() => {
    createWindow();
    ipcMain.on('set-number-of-suggestions', setNumberOfSuggestionsHandler);
    ipcMain.on('minimize-window', minimizeWindow);
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
    startServer();
  })
  .catch(console.log);
