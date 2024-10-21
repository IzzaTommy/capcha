// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';

// global variables
const THUMBNAIL_SIZE = '320x180';
const __dirname = import.meta.dirname;
const defVideoDirectory = path.join(app.getPath('videos'), 'CapCha');
const defThumbnailDirectory = path.join(app.getPath('userData'), 'thumbnails');
const obsExecutablePath = path.join(__dirname, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'bin', '64bit', 'obs64.exe');

const store = new Store({
    defaults: {
        navBarActive: true,
        
        volume: 0.5,
        volumeMuted: true,

        darkMode: true,

        saveLocation: defVideoDirectory,
        storageLimit: 100,
        fileExtension: '.mp4',
        encoder: 'jim_nvenc',

        // captureDisplay: '',
        resolutionWidth: 2560,
        resolutionHeight: 1440,
        framerate: 60,
        bitrate: 30,
        autoRecord: false,

        // audio: '',
        // microphone: '',
        // webcam: ''
    },
    schema: {
        navBarActive: {
            type: 'boolean'
        },

        volume: {
            type: 'number',
            minimum: 0,
            maximum: 1,
        },
        volumeMuted: {
            type: 'boolean'
        },

        darkMode: {
            type: 'boolean'
        },

        saveLocation: {
            type: 'string'
        },
        storageLimit: {
            type: 'number',
            minimum: 0,
            maximum: 500
        },
        fileExtension: {
            type: 'string',
            enum: ['.mp4', '.mkv', '.avi']
        },
        encoder: {
            type: 'string',
            enum: ['nvenc', 'jim_nvenc', 'h.264']
        },

        captureDisplay: {
            type: 'string'
        },
        resolutionWidth: {
            type: 'number',
            minimum: 1,
            maximum: 2560
        },
        resolutionHeight: {
            type: 'number',
            minimum: 1,
            maximum: 1440
        },
        framerate: {
            type: 'number',
            minimum: 10,
            maximum: 60
        },
        bitrate: {
            type: 'number',
            minimum: 3,
            maximum: 100
        },
        
        audio: {
            type: 'string'
        },
        microphone: {
            type: 'string'
        },
        webcam: {
            type: 'string'
        }
    }
});

let ws;

let mainWindow;

let obsProcess;

// loads the app when ready
app.on('ready', () => {
    // start OBS
    obsProcess = spawn(obsExecutablePath, [
        '--portable',
        '--multi',
        '--minimize-to-tray'
    ], {
        cwd: path.dirname(obsExecutablePath),
    });

    // attempt Web Socket connection
    attemptConnection();

    // start the window
    mainWindow = new BrowserWindow({
        minWidth: 1280,
        minHeight: 900,
        show: false,
        icon: path.join(__dirname, '..', 'assets', 'app-icon', 'capcha-app-icon.png'),
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    // start index.html maximized
    mainWindow.maximize();
    mainWindow.loadFile('src/renderer/index.html');

    mainWindow.webContents.openDevTools();

    // on close, grab the video volume setting
    mainWindow.on('close', (event) => {
        event.preventDefault();

        mainWindow.webContents.send('settings:reqVolumeSettings');
    });
});





function attemptConnection() {
    if (ws) {
       
        ws.removeAllListeners();
        ws.terminate();
    }

    ws = new WebSocket('ws://localhost:4444');

    ws.on('open', () => {
        console.log('Connected to OBS WebSocket');

        ws.removeAllListeners('error');
        ws.removeAllListeners('close');
        initWebSocket();

        const message = {
            'op': 1,
            'd': { rpcVersion: 1 }
        };
        
        ws.send(JSON.stringify(message));
        
    });

    ws.on('error', (error) => {
        console.error('1 Connection error:', error['code']);
    });

    ws.on('close', (code, reason) => {
        console.log('2 Disconnected from OBS WebSocket');
        console.log('3 Code:', code, 'Reason:', reason.toString());
        console.log('4 Retrying connection...');
        setTimeout(attemptConnection, 3000);
    });
}

app.on('before-quit', () => {
    obsProcess.kill('SIGTERM');
});



function initWebSocket() {

    
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

        console.log('--------------------------------');
    });
    
    ws.on('close', (code, reason) => {
        console.log('--------------------------------');
        console.log('Disconnected from OBS WebSocket');
        console.log('Code:', code);
        console.log('Reason:', reason.toString());
        console.log('--------------------------------');
    });
    
    ws.on('error', (error) => {
        console.log('--------------------------------');
        console.error('WebSocket error: \n', error['code']);

        if (error['code'] === ' ECONNREFUSED') {
            setTimeout(attemptConnection, 2000);
        }
        console.log('--------------------------------');
    });
}


ipcMain.on('ws-fn', (_, requestType, requestData) => {
    console.log(` --- Sending ${requestType} request to OBS WebSocket with data:`, requestData);

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

// minimizes the window
ipcMain.on('window:minimize', (_) => mainWindow.minimize());
// maximizes or unmaximizes the window
ipcMain.on('window:maximize', (_) => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow.maximize();
    }
});
// closes the window and triggers event
ipcMain.on('window:close', (_) => mainWindow.close());

// gets the entire settings object
ipcMain.handle('settings:getAllSettings', (_) => { return store.store });

// sets the value of a specific setting
ipcMain.handle('settings:setSetting', async (_, key, value) => {
    switch (key) {
        // keeps width between 1 and 2560, as an integer
        case 'resolutionWidth':
            if (value > 2560 || isNaN(value)) {
                value = 2560;
            }
            else {
                if (value < 1) {
                    value = 1;
                }
                else {
                    value = Math.floor(value);
                }
            }
            break;
        // keeps height between 1 and 1440, as an integer
        case 'resolutionHeight':
            if (value > 1440 || isNaN(value)) {
                value = 1440;
            }
            else {
                if (value < 1) {
                    value = 1;
                }
                else {
                    value = Math.floor(value);
                }
            }
            break;
        // allows user to select new directory, or keeps the old one
        case 'saveLocation':
            const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
    
            if (!canceled && filePaths[0] !== value) {
                value = filePaths[0];

                try {
                    // delete the thumbnail directory
                    await fs.rm(defThumbnailDirectory, { recursive: true, force: true });
            
                    // recreate the thumbnail directory
                    await fs.mkdir(defThumbnailDirectory);
                }
                catch {
                    console.error('Error reseting directory!');
                }

                mainWindow.webContents.send('files:reqLoadGallery');
            }

            break;
        // ensures type correctness
        default: 
            if (!isNaN(value) && typeof(value) !== 'boolean') {
                value = Number(value);
            }
    }

    // set the new filtered value
    store.set(key, value);

    // return the value to renderer process for display
    return value;
});

// sets the volume when the app closes
ipcMain.once('settings:setVolumeSettings', (_, volumeSettings) => {
    store.set('volume', volumeSettings['volume']);
    store.set('volumeMuted', volumeSettings['volumeMuted']);
    mainWindow.destroy();
});

// gets all of the video files and meta data from the save location directory
ipcMain.handle('files:getAllVideosData', async (_) => {
    // get the save location stored in the settings
    const directory = store.get('saveLocation');

    // make the thumbnail directory and video directory (latter should already exist)
    await Promise.all([
        fs.mkdir(defThumbnailDirectory, { recursive: true }),
        fs.mkdir(directory, { recursive: true })
    ]);

    // read the video directory for files
    const files = await fs.readdir(directory);

    // filter by video extensions
    const videos = files.filter(file =>
        ['.mp4', '.mkv', '.avi'].includes(path.extname(file).toLowerCase())
    );

    // get video meta data and thumbnail
    const videosData = await Promise.all(
        videos.map(async video => {
            try {
                const videoName = path.parse(video).name;
                const videoPath = path.join(directory, video);

                const [videoMetaData, thumbnailPath] = await Promise.all([
                    fs.stat(videoPath),
                    path.join(defThumbnailDirectory, `${videoName}.png`)
                ]);

                // create thumbnail if it does not exist
                try {
                    await fs.access(thumbnailPath);
                }
                catch {
                    await new Promise((resolve, reject) => {
                        ffmpeg(videoPath)
                            .on('end', resolve)
                            .on('error', reject)
                            .screenshots({
                                timestamps: ['50%'],
                                filename: videoName,
                                folder: defThumbnailDirectory,
                                size: THUMBNAIL_SIZE
                            });
                    });
                }

                // return data on the video
                return {
                    nameExt: video,
                    path: videoPath,
                    size: videoMetaData.size,
                    created: videoMetaData.birthtime,
                    thumbnailPath: thumbnailPath
                };
            }
            catch {
                console.log('Video Reading Error!');
                return null;
            }
        })
    );

    // return all the data on the videos
    return videosData.filter(videoData => videoData !== null).sort((a, b) => b.created - a.created);
});

