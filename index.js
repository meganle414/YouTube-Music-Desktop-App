// const { create } = require('domain');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const fs = require('fs');
const logFilePath = path.join(app.getPath('userData'), 'app.log');

function log(message) {
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}

log('App started');

let Store;
(async () => {
    const module = await import('electron-store');
    Store = module.default;
    initializeApp();
})();

let mainWindow;
let store;

function createWindow() {
    log('Creating window');
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(app.getAppPath(), 'preload.js'),
        },
        autoHideMenuBar: true,
        menuBarVisible: false
    });

    // Load YouTube Music URL
    mainWindow.loadURL('https://music.youtube.com/');

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        log(`Failed to load content: ${errorDescription}`);
    });

    // Open DevTools for debugging
    // mainWindow.webContents.openDevTools();

    // Restore volume settings
    const savedVolume = store.get('volume', 0.5);
    mainWindow.webContents.executeJavaScript(`
        document.querySelector('video').volume = ${savedVolume};
    `);

    mainWindow.on('closed', () => {
        log('Window close event triggered');
        mainWindow = null;
    });

    // Ensure the window is visible
    // mainWindow.once('ready-to-show', () => {
    //     mainWindow.show();
    //     mainWindow.focus();
    //     log('Window should be visible and focused');
    // });
}

function initializeApp() {
    log('App initializing');
    store = new Store();  // Initialize `Store` after it's imported
    log('Store initialized');

    // app.whenReady().then(createWindow);
    app.whenReady().then(() => {
        log('App is ready');
        createWindow();
      
        app.on('activate', () => {
          if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
          }
        });
      });

    // Save volume setting before app closes
    ipcMain.on('volume-changed', (event, volume) => {
        store.set('volume', volume);
    });

    app.on('before-quit', (event) => {
        log('App is about to quit');
    });

    app.on('will-quit', () => {
        log('App will quit');
    });    

    app.on('window-all-closed', () => {
        log('All windows are closed');
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
}
