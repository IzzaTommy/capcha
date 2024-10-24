// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import EventEmitter from 'events';

import { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, GLOBAL_EMITTER, components, initVariables } from './variablesEJS.js';
import { initMainWindow, initMainWindowL } from './mainWindowEJS.js';
import { initOBS } from './obsEJS.js';
import { initWebSocket, initWebSocketL } from './webSocketEJS.js';

export { initSettings, initSettingsL };

function initSettings() {
    components['store'] = new Store({
        defaults: {
            navBarActive: true,
            
            volume: 0.5,
            volumeMuted: true,
    
            darkMode: true,
    
            saveLocation: DEF_VIDEO_DIRECTORY,
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

    // console.log(screen.getAllDisplays());
    // wsFunction('GetVideoSettings');

    //if not set, then set display
    //otherwise check if the set display is valid
}

function initSettingsL() {
    // gets the entire settings object
    ipcMain.handle('settings:getAllSettings', (_) => { return components['store'].store });
    
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
                const { canceled, filePaths } = await dialog.showOpenDialog(components['mainWindow'], { properties: ['openDirectory'] });
        
                if (!canceled && filePaths[0] !== value) {
                    value = filePaths[0];
    
                    try {
                        // delete the thumbnail directory
                        await fs.rm(DEF_THUMBNAIL_DIRECTORY, { recursive: true, force: true });
                
                        // recreate the thumbnail directory
                        await fs.mkdir(DEF_THUMBNAIL_DIRECTORY);
                    }
                    catch {
                        console.error('Error reseting directory!');
                    }
    
                    components['mainWindow'].webContents.send('files:reqLoadGallery');
                }
    
                break;
            // ensures type correctness
            default: 
                if (!isNaN(value) && typeof(value) !== 'boolean') {
                    value = Number(value);
                }
        }
    
        // set the new filtered value
        components['store'].set(key, value);
    
        // return the value to renderer process for display
        return value;
    });
    
    // sets the volume when the app closes
    ipcMain.once('settings:setVolumeSettings', (_, volumeSettings) => {
        components['store'].set('volume', volumeSettings['volume']);
        components['store'].set('volumeMuted', volumeSettings['volumeMuted']);
        components['mainWindow'].destroy();
    });
    
    // gets all of the video files and meta data from the save location directory
    ipcMain.handle('files:getAllVideosData', async (_) => {
        // get the save location stored in the settings
        const directory = components['store'].get('saveLocation');
    
        // make the thumbnail directory and video directory (latter should already exist)
        await Promise.all([
            fs.mkdir(DEF_THUMBNAIL_DIRECTORY, { recursive: true }),
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
                        path.join(DEF_THUMBNAIL_DIRECTORY, `${videoName}.png`)
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
                                    folder: DEF_THUMBNAIL_DIRECTORY,
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
}