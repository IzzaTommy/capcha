// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';

import { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, instances, pendingRequests, initMainVariables, SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, settingsData } from './mainVariables.js';
import { initMainWindow, initMainWindowL } from './mainWindow.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, initMainWebSocketL, webSocketSend } from './mainWebSocket.js';

export { initMainSettings, initMainSettingsL };

async function initMainSettings() {
    //validate settings here...
    console.log('\n---------------- SETTINGS DATA ----------------');
    for (const [key, value] of settingsData) {
        // console.log(key, ': ', value);
        settingsData[key] = validateSetting(key, value);
        console.log(key, ': ', value);
    }

    if (!(await webSocketSend('GetProfileList'))['profiles'].includes('CapCha'))
    {
        await webSocketSend('CreateProfile', { profileName: 'CapCha' });
    }

    await webSocketSend('SetCurrentProfile', { profileName: 'CapCha' });

    await webSocketSend('SetProfileParameter', { parameterCategory: 'Output', parameterName: 'Mode', parameterValue: 'Advanced' });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecType', parameterValue: 'Standard' });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'FPSType', parameterValue: '1' });
    // // file name formatting

    await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFilePath', parameterValue: settingsData.get('capturesPath') });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFormat2', parameterValue: settingsData.get('format') });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecEncoder', parameterValue: settingsData.get('encoder') });

    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCX', parameterValue: `${settingsData.get('recordingWidth')}` });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCY', parameterValue: `${settingsData.get('recordingHeight')}` });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCX', parameterValue: `${settingsData.get('recordingWidth')}` });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCY', parameterValue: `${settingsData.get('recordingHeight')}` });

    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'FPSInt', parameterValue: `${settingsData.get('framerate')}` });
}

function initMainSettingsL() {
    // gets the entire settings object
    ipcMain.handle('settings:getAllSettings', (_) => { return settingsData.store });
    
    // sets the value of a specific setting
    ipcMain.handle('settings:setSetting', async (_, key, value) => {
        // console.log('1--', key, ': ', value, ' - ', typeof(value));
        switch (key) {

            // allows user to select new directory, or keeps the old one
            //reloading before sending new gallery?
            case 'capturesPath':
                const { canceled, filePaths } = await dialog.showOpenDialog(instances['mainWindow'], { properties: ['openDirectory'] });
        
                if (!canceled && filePaths[0] !== value) {
                    value = filePaths[0];
    
                    try {
                        // delete the thumbnail directory
                        await fs.rm(DEF_THUMBNAIL_DIRECTORY, { recursive: true, force: true });
                
                        // recreate the thumbnail directory
                        await fs.mkdir(DEF_THUMBNAIL_DIRECTORY);
                    }
                    catch {
                        console.error('Error reseting thumbnails directory!');
                    }
    
                    instances['mainWindow'].webContents.send('files:reqLoadGallery');
                }
    
                break;

            case 'encoder':
                webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecEncoder', parameterValue: value });
                break;

            case 'bitrate':
                try {
                    let recordEncoderData;
            
                    if (settingsData.get('encoder') == 'obs_x264') {
                        recordEncoderData = {"bitrate": value};
                    }
                    else {
                        recordEncoderData = {"rate_control": "CBR", "bitrate": value};
                    }
                    writeFileSync(path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json'), JSON.stringify(recordEncoderData), { encoding: 'utf8', mode: 0o644 });
                    console.log('File has been written successfully with options');
                } catch (err) {
                    console.error('Error writing to file:', err);
                }

                break;
            // ensures type correctness
            default: 
                // console.log('something broke!');
        }

        value = validateSetting(key, value);
    
        // console.log('2--', key, ': ', value, ' - ', typeof(value));
        // set the new filtered value
        settingsData.set(key, value);
    
        // return the value to renderer process for display
        return value;
    });
    
    // sets the volume when the app closes
    ipcMain.once('settings:setVolumeSettings', (_, volumeSettings) => {
        settingsData.set('volume', volumeSettings['volume']);
        settingsData.set('volumeMuted', volumeSettings['volumeMuted']);
        instances['mainWindow'].destroy();
    });
    
    // gets all of the video files and meta data from the save location directory
    ipcMain.handle('files:getAllVideosData', async (_) => {
        // get the save location stored in the settings
        const directory = settingsData.get('capturesPath');
    
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

function validateSetting(key, value) {
    switch (key) {
        case 'navBarActive':
            // console.log(typeof(value));
            if (typeof(value) !== 'boolean') {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            break;

        case 'volume':
            if (!isNaN(value)) {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            else {
                if (value > SETTINGS_DATA_SCHEMA[key]['maximum']) {
                    value = SETTINGS_DATA_SCHEMA[key]['maximum'];
                }
                else {
                    if (value < SETTINGS_DATA_SCHEMA[key]['minimum']) {
                        value = SETTINGS_DATA_SCHEMA[key]['minimum'];
                    }
                }

                value = Number(value);
            }
            break;

        case 'volumeMuted':
            if (typeof(value) !== 'boolean') {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            break;

        case 'darkMode':
            if (typeof(value) !== 'boolean') {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            break;

        // allows user to select new directory, or keeps the old one
        //reloading before sending new gallery?
        case 'capturesPath':
            if (typeof(value) !== 'string' || !existsSync(value)) {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            
            break;

        case 'capturesLimit':
            if (!SETTINGS_DATA_SCHEMA[key]['enum'].includes(Number(value))) {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            else {
                value = Number(value);
            }
            break;

        case 'format':
            if (!SETTINGS_DATA_SCHEMA[key]['enum'].includes(value)) {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            break;

        case 'encoder':
            if (!SETTINGS_DATA_SCHEMA[key]['enum'].includes(value)) {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            break;

        // keeps width between 1 and 2560, as an integer
        case 'recordingWidth':
            if (!isNaN(value)) {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            else {
                if (value > SETTINGS_DATA_SCHEMA[key]['maximum']) {
                    value = SETTINGS_DATA_SCHEMA[key]['maximum'];
                }
                else {
                    if (value < SETTINGS_DATA_SCHEMA[key]['minimum']) {
                        value = SETTINGS_DATA_SCHEMA[key]['minimum'];
                    }
                    else {
                        value = Math.floor(value);
                    }
                }

                value = Number(value);
            }
            break;
        // keeps height between 1 and 1440, as an integer
        case 'recordingHeight':
            if (!isNaN(value)) {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            else {
                if (value > SETTINGS_DATA_SCHEMA[key]['maximum']) {
                    value = SETTINGS_DATA_SCHEMA[key]['maximum'];
                }
                else {
                    if (value < SETTINGS_DATA_SCHEMA[key]['minimum']) {
                        value = SETTINGS_DATA_SCHEMA[key]['minimum'];
                    }
                    else {
                        value = Math.floor(value);
                    }
                }

                value = Number(value);
            }
            break;

        case 'framerate':
            if (!SETTINGS_DATA_SCHEMA[key]['enum'].includes(Number(value))) {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            else {
                value = Number(value);
            }
            break;

        case 'bitrate':
            if (!SETTINGS_DATA_SCHEMA[key]['enum'].includes(Number(value))) {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            else {
                value = Number(value);
            }
            break;

        case 'autoRecord':
            if (typeof(value) !== 'boolean') {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
            break;

        default: 
            console.log('Invalid setting: ', key);
    }

    return value;
}