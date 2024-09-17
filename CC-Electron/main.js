import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs } from 'fs';
import Store from 'electron-store';

const __dirname = import.meta.dirname;
const ws = new WebSocket('ws://localhost:4444');
const store = new Store({
    defaults: {
        theme: 'dark',
        
        volume: 0.5,

        saveLocation: 'videos',
        storageLimit: 100,
        fileExtension: '.mp4',
        encoder: 'jim_nvenc',

        resolutionWidth: 2560,
        resolutionHeight: 1440,
        framerate: 60,
        bitrate: 30
    },
    schema: {
        theme: {
            type: 'string',
            enum: ['light', 'dark'],
        },

        volume: {
            type: 'number',
            minimum: 0,
            maximum: 1,
        },

        saveLocation: {
            type: 'string',
        },
        storageLimit: {
            type: 'number',
            minimum: 0,
            maximum: 500,
        },
        fileExtension: {
            type: 'string',
            enum: ['.mp4', '.mkv', '.avi'],
        },
        encoder: {
            type: 'string',
            enum: ['nvenc', 'jim_nvenc', 'h.264'],
        },

        resolutionWidth: {
            type: 'number',
            minimum: 100,
            maximum: 2560,
        },
        resolutionHeight: {
            type: 'number',
            minimum: 100,
            maximum: 1440,
        },
        framerate: {
            type: 'number',
            minimum: 10,
            maximum: 60,
        },
        bitrate: {
            type: 'number',
            minimum: 3,
            maximum: 100,
        }
    }
});

let mainWindow;

/* window function */
function createWindow() {
    mainWindow = new BrowserWindow({
        minWidth: 1280,
        minHeight: 900,
        show: false,
        icon: path.join(__dirname, 'diagrams', 'CapCraft Window Logo.png'),
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    mainWindow.maximize();

    mainWindow.loadFile('index.html');

    mainWindow.webContents.openDevTools();

    mainWindow.on('close', (event) => {
        event.preventDefault();

        mainWindow.webContents.send('settings:reqSave');

        ipcMain.once('settings:setAll', (_, settings) => {
            store.set(settings);
            mainWindow.destroy();
        });
    });
}

/* web socket handler */
function initWebSocket() {
    ws.on('open', () => {
        console.log('Connected to OBS WebSocket');

        const message = {
            'op': 1,
            'd': { rpcVersion: 1 }
        };
        
        ws.send(JSON.stringify(message));
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data);

        console.log('--------------------------------');

        console.log('OP:', message['op']);
        for (const [key, value] of Object.entries(message['d'])) {
            console.log(key, ': ', value);
        }

        switch (message['op']) {
            case 0:
                console.log('Info: Hello!');
                break;
            case 2:
                console.log('Info: Received and validated connection, ready for normal operation.');
                break;
            case 5:
                console.log('Info: An event from OBS has occurred.');
                break;
            case 7:
                console.log('Info: Responding to request from client.');

                if (message['d']['requestStatus']['result']) {
                    console.log('Status: Request succeeded.');
                } 
                else {
                    console.log('Status: Request failed.');
                    console.error(message['d']['requestStatus']['comment']);
                }
                break;
            case 9:
                console.log('Info: Responding to request batch from client.');
                break;
            default:
                console.log('Info: Uncaught OP.')
        }
    });

    ws.on('close', (code, reason) => {
        console.log('--------------------------------');
        console.log('Disconnected from OBS WebSocket');
        console.log('Code:', code);
        console.log('Reason:', reason.toString());
    });

    ws.on('error', (error) => {
        console.log('--------------------------------');
        console.error('WebSocket error:', error);
    });
}

/* ipc handler */
function initIPC() {
    ipcMain.on('ws-fn', (_, requestType, requestData) => {
        console.log(`Sending ${requestType} request to OBS WebSocket with data:`, requestData);

        if (ws && ws.readyState === WebSocket.OPEN) {
            const requestMessage = {
                'op': 6,
                'd': {
                    requestType: requestType,
                    requestData: requestData,
                    requestId: Math.random().toString(36).substring(4)
                }
            };

            ws.send(JSON.stringify(requestMessage));
        } 
        else {
            console.log('WebSocket is not open. Cannot send message.');
        }
    });

    ipcMain.on('window:minimize', (_) => mainWindow.minimize());
    ipcMain.on('window:maximize', (_) => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        }
        else {
            mainWindow.maximize();
        }
    });
    ipcMain.on('window:close', (_) => mainWindow.close());


    ipcMain.handle('settings:getAll', () => { return store.store });

    ipcMain.handle('dialog:getDirectory', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
        
        if (!canceled) {
            return filePaths[0];
        }
    });

    // ipcMain.handle('get-videos', async (_, directory) => {
    //     try {
    //         const videoFiles = await getVideoFiles(directory);
    //         return videoFiles;
    //     } catch (error) {
    //         console.error('Error getting video files:', error);
    //         return [];
    //     }
    // });
}

/* file system handler */
// function getVideoFiles(directory) {
//     return new Promise((resolve, reject) => {
//         fs.readdir(directory, (err, files) => {
//             if (err) return reject(err);

//             const videoFiles = files
//                 .filter(file => ['.mp4', '.avi', '.mkv'].includes(path.extname(file))) // Filter by video extensions
//                 .map(file => {
//                     const filePath = path.join(directory, file);
//                     const stats = fs.statSync(filePath); // Get file metadata

//                     return {
//                         fileName: file,
//                         filePath: filePath,
//                         size: stats.size, // Size in bytes
//                         createdAt: stats.birthtime, // Creation date
//                         modifiedAt: stats.mtime // Last modified date
//                     };
//                 });

//             resolve(videoFiles);
//         });
//     });
// }

/* app functions */
app.whenReady().then(() => {
    createWindow();
    initWebSocket();
    initIPC();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});