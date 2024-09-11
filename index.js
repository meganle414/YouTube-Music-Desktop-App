// const { create } = require('domain');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let store;
let Store;

(async () => {
    const module = await import('electron-store');
    Store = module.default;
    initializeApp();
})();

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

    // Restore volume settings
    const savedVolume = store.get('volume', 0.5);
    mainWindow.webContents.executeJavaScript(`
        document.querySelector('video').volume = ${savedVolume};
    `);

    mainWindow.on('close', () => {
        mainWindow = null;
    });
}

function initializeApp() {
    // Initialize `Store` after it's imported
    store = new Store();

    app.whenReady().then(() => {
        log('App is ready');
        createWindow();
      
        app.on('activate', () => {
          // Open a window if clicked, despite how many are already open
          if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
          }
        });
      });

    // Save volume setting before app closes
    ipcMain.on('volume-changed', (event, volume) => {
        store.set('volume', volume);
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
}