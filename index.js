const { app, session, BrowserWindow, ipcMain } = require('electron');
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
        menuBarVisible: false,
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
    // Initialize `Store` after it's imported
    store = new Store();

    app.whenReady().then(() => {
        createWindow();
      
        app.on('activate', () => {
          if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
          }
        });
    });

    // app.whenReady().then(async () => {
    //     await session.defaultSession.loadExtension(path.join(app.getAppPath(), 'uBlock Origin Lite'));
    // });

    app.whenReady().then(async () => {
        // Load uBlock Origin extension
        try {
            await session.defaultSession.loadExtension(path.join(app.getAppPath(), 'uBlock Origin Lite - Chrome Web Store 2024.9.1.1266.crx'));
            console.log('Extension loaded successfully');
        } catch (error) {
            console.error('Failed to load extension:', error.message);
        }
    });

    session.defaultSession.getAllExtensions().then(extensions => {
        console.log('Loaded extensions:', extensions);
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
