const { app, session, BrowserWindow, nativeImage, ipcMain } = require('electron');
const path = require('path');
const os = require('os')

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
    
    // Set thumbbar buttons based on current state
    const state = store.get('state', 'paused');
    setThumbarButtons(state);
    
    // Restore volume settings
    const savedVolume = store.get('volume', 0.5);
    mainWindow.webContents.executeJavaScript(`
        document.querySelector('video').volume = ${savedVolume};
    `);

    // let isQuitting = false;

    // mainWindow.on('close', (e) => {
    //     if (!isQuitting) {
    //         e.preventDefault();
    //         try {
    //             isQuitting = true;
    //             mainWindow.close();
    //         } catch (error) {
    //             console.log('Window already closed');
    //         }
    //     }
    // });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function setThumbarButtons(state) {
    let backClickCounter = 0;
    let backClickTimeout;

    const backButton = {
        tooltip: 'Back',
        icon: nativeImage.createFromPath(path.join(app.getAppPath(), 'images/back.png')),
        click: () => {
            backClickCounter += 1;
            // Set a timer to check if it's a double click
            if (backClickCounter === 1) {
                backClickTimeout = setTimeout(() => {
                    // Single click: go to the start of the current video
                    mainWindow.webContents.executeJavaScript(`
                        document.querySelector('video').currentTime = 0;
                    `);
                    backClickCounter = 0; // Reset counter after single click action
                }, 750); // 750ms window for double click
            } else if (backClickCounter === 2) {
                // Double click: go to the previous song
                clearTimeout(backClickTimeout); // Cancel single click action
                mainWindow.webContents.executeJavaScript(`
                    document.querySelector('.previous-button').click();
                `);
                backClickCounter = 0; // Reset counter after double click action
            }
        }
    };
    
    const playButton = {
        tooltip: state === 'paused' ? 'Play' : 'Pause',
        icon: nativeImage.createFromPath(path.join(app.getAppPath(), state === 'paused' ? 'images/play.png' : 'images/pause.png')),
        click: () => {
            const action = state === 'paused' ? 'play' : 'pause';
            mainWindow.webContents.executeJavaScript(`
                document.querySelector('video').${action}();
            `);
        }
    };

    const skipButton = {
        tooltip: 'Skip',
        icon: nativeImage.createFromPath(path.join(app.getAppPath(), 'images/skip.png')),
        click: () => {
            mainWindow.webContents.executeJavaScript(`
                document.querySelector('.next-button').click();
            `);
        }
    };

    mainWindow.setThumbarButtons([backButton, playButton, skipButton]);
}

function initializeApp() {
    // Initialize `Store` after it's imported
    store = new Store();

    // app.whenReady().then(() => {
    //     createWindow();
      
    //     app.on('activate', () => {
    //       if (BrowserWindow.getAllWindows().length === 0) {
    //         createWindow();
    //       }
    //     });
    // });

    // app.whenReady().then(async () => {
    //     // Load adblocking extension
    //     try {
    //         await session.defaultSession.loadExtension(path.join(os.homedir(), 'AppData/Local/Google/Chrome/User Data/Default/Extensions/cfhdojbkjhnklbpkdaibdccddilifddb/4.7_0'));
    //         console.log('Extension loaded successfully');
    //         createWindow();
      
    //         app.on('activate', () => {
    //         if (BrowserWindow.getAllWindows().length === 0) {
    //             createWindow();
    //         }
    //         });
    //     } catch (error) {
    //         console.error('Failed to load extension:', error.message);
    //     }
    // });

    app.whenReady().then(async () => {
        // try {
        //     const { ElectronBlocker } = require('@cliqz/adblocker-electron');
        //     const fetch = require('cross-fetch'); // Required for ElectronBlocker

        //     ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
        //         blocker.enableBlockingInSession(session.defaultSession);
        //         console.log('Ad-blocking enabled');
        //     });
        // } catch (error) {
        //     console.error('Failed to load blocker:', error);
        // }

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

    ipcMain.on('state-changed', (event, state) => {
        store.set('state', state);
        setThumbarButtons(state);
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
}
