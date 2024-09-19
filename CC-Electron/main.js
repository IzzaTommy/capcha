import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';

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
            minimum: 1,
            maximum: 2560,
        },
        resolutionHeight: {
            type: 'number',
            minimum: 1,
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

// const appDataPath = path.join(app.getPath('userData'), 'thumbnails');

// if (!fs.existsSync(appDataPath)) {
//     fs.mkdirSync(appDataPath, { recursive: true });
// }




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

        mainWindow.webContents.send('settings:getVolume');
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


    ipcMain.handle('settings:getAll', (_) => { return store.store });

    ipcMain.handle('settings:set', async (_, key, value) => {
        let setValue;

        switch (key) {
            case 'resolutionWidth':
                if (value > 2560 || isNaN(value)) {
                    setValue = 2560;
                }
                else {
                    if (value < 1) {
                        setValue = 1;
                    }
                    else {
                        setValue = Math.floor(value);
                    }
                }
                break;
            case 'resolutionHeight':
                if (value > 1440 || isNaN(value)) {
                    setValue = 1440;
                }
                else {
                    if (value < 1) {
                        setValue = 1;
                    }
                    else {
                        setValue = Math.floor(value);
                    }
                }
                break;
            case 'saveLocation':
                const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
        
                if (canceled) {
                    setValue = value;
                }
                else {
                    setValue = filePaths[0];
                }
                break;
            default: 
                if (isNaN(value)) {
                    setValue = value;
                }
                else {
                    setValue = Number(value);
                }
        }

        store.set(key, setValue);

        return setValue;
    });

    ipcMain.once('settings:setVolume', (_, value) => {
        store.set('volume', value);
        mainWindow.destroy();
    });

    ipcMain.handle('files:getAll', async (_, directory) => {
        const thumbnailDir = path.join(app.getPath('userData'), 'thumbnails');

        await fs.mkdir(thumbnailDir, { recursive: true });

        const files = await fs.readdir(directory);

        const videoFiles = files.filter(file =>
            ['.mp4', '.mkv', '.avi'].includes(path.extname(file).toLowerCase())
        );

        const fileData = await Promise.all(videoFiles.map(async file => {
            const filePath = path.join(directory, file);
            const stats = await fs.stat(filePath);
            const thumbnailPath = path.join(thumbnailDir, `${path.parse(file).name}.png`);


            try {
                await fs.access(thumbnailPath);
            } catch {

                await new Promise((resolve, reject) => {
                    ffmpeg(filePath)
                        .on('end', resolve)
                        .on('error', reject)
                        .screenshots({
                            timestamps: ['50%'],
                            filename: path.basename(thumbnailPath),
                            folder: path.dirname(thumbnailPath),
                            size: '320x180'
                        });
                });
            }

            return {
                fileName: file,
                filePath: filePath,
                size: stats.size,
                created: stats.birthtime,
                thumbnail: thumbnailPath
            };
        }));

        console.log(fileData);
        console.log(fileData.sort((a, b) => b.created - a.created));

        return fileData.sort((a, b) => b.created - a.created);
    });

    // ipcMain.handle('dialog:getDirectory', async (_) => {
    //     const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
        
    //     if (!canceled) {
    //         return filePaths[0];
    //     }
    // });
}

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