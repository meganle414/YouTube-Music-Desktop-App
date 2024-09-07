const { create } = require('domain');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let Store;
(async () => {
    // Dynamic import for `electron-store`
    const module = await import('electron-store');
    Store = module.default;
    initializeApp();
})();

let mainWindow;
let store;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),
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

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function initializeApp() {
    store = new Store();  // Initialize `Store` after it's imported

    app.whenReady(createWindow());

    // Save volume setting before app closes
    ipcMain.on('volume-changed', (event, volume) => {
        store.set('volume', volume);
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });
}
