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
    console.log('\n---------------- SETTINGS DATA ----------------');

    // create CapCha profile
    if (!(await webSocketSend('GetProfileList'))['profiles'].includes('CapCha'))
    {
        await webSocketSend('CreateProfile', { profileName: 'CapCha' });
    }

    // set to CapCha profile
    await webSocketSend('SetCurrentProfile', { profileName: 'CapCha' });

    // set basic settings
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Output', parameterName: 'Mode', parameterValue: 'Advanced' });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecType', parameterValue: 'Standard' });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'FPSType', parameterValue: '1' });
    /* file name formatting */

    // set captures path
    await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFilePath', parameterValue: settingsData.get('capturesPath') });
    // set format
    await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFormat2', parameterValue: settingsData.get('format') });
    // set encoder
    await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecEncoder', parameterValue: settingsData.get('encoder') });
    // set recording width
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCX', parameterValue: `${settingsData.get('recordingWidth')}` });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCX', parameterValue: `${settingsData.get('recordingWidth')}` });
    // set recording height
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCY', parameterValue: `${settingsData.get('recordingHeight')}` });
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCY', parameterValue: `${settingsData.get('recordingHeight')}` });
    // set framerate
    await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'FPSInt', parameterValue: `${settingsData.get('framerate')}` });
    // set bitrate
    try {
        let recordEncoderData;

        if (settingsData.get('encoder') == 'obs_x264') {
            recordEncoderData = { 'bitrate': settingsData.get('bitrate') };
        }
        else {
            recordEncoderData = { 'rate_control': 'CBR', 'bitrate': settingsData.get('bitrate') };
        }
        writeFileSync(path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json'), JSON.stringify(recordEncoderData), { encoding: 'utf8', mode: 0o644 });
        console.log('File has been written successfully with options');
    } 
    catch (error) {
        console.error('Error writing to file: ', error);
    }
}

function initMainSettingsL() {
    // gets the entire settings object
    ipcMain.handle('settings:getAllSettings', (_) => { return settingsData.store });
    
    // sets the value of a specific setting
    ipcMain.handle('settings:setSetting', async (_, key, value) => {
        console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);

        value = validateSetting(key, value);

        switch (key) {
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
                }

                // should realistically never run
                if (!existsSync(value)) {
                    value = SETTINGS_DATA_DEFAULTS[key];
                }

                console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                settingsData.set(key, value);

                await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFilePath', parameterValue: settingsData.get('capturesPath') });
                break;

            case 'format':
                console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                settingsData.set(key, value);

                await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFormat2', parameterValue: settingsData.get('format') });
                break;

            case 'encoder':
                settingsData.set(key, value);

                await webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecEncoder', parameterValue: value });

                try {
                    let recordEncoderData;
            
                    if (value == 'obs_x264') {
                        recordEncoderData = { 'bitrate': settingsData.get('bitrate') };
                    }
                    else {
                        recordEncoderData = { 'rate_control': 'CBR', 'bitrate': settingsData.get('bitrate') };
                    }
                    writeFileSync(path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json'), JSON.stringify(recordEncoderData), { encoding: 'utf8', mode: 0o644 });
                    console.log('File has been written successfully with options');

                    console.log('REAPPLIED BITRATE: ', settingsData.get('bitrate'));
                } 
                catch (error) {
                    console.error('Error writing to file: ', error);
                }
                break;

            case 'recordingWidth':
                console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                settingsData.set(key, value);

                await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCX', parameterValue: `${settingsData.get('recordingWidth')}` });
                await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCX', parameterValue: `${settingsData.get('recordingWidth')}` });
                break;

            case 'recordingHeight':
                console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                settingsData.set(key, value);

                await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCY', parameterValue: `${settingsData.get('recordingHeight')}` });
                await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCY', parameterValue: `${settingsData.get('recordingHeight')}` });
                break;

            case 'framerate':
                console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                settingsData.set(key, value);

                await webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'FPSInt', parameterValue: `${settingsData.get('framerate')}` });
                break;

            case 'bitrate':
                try {
                    let recordEncoderData;
            
                    if (settingsData.get('encoder') == 'obs_x264') {
                        recordEncoderData = { 'bitrate': value };
                    }
                    else {
                        recordEncoderData = { 'rate_control': 'CBR', 'bitrate': value };
                    }
                    writeFileSync(path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json'), JSON.stringify(recordEncoderData), { encoding: 'utf8', mode: 0o644 });
                    console.log('File has been written successfully with options');

                    console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                    settingsData.set(key, value);
                } 
                catch (error) {
                    console.error('Error writing to file: ', error);
                }
                break;
            default:
                console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                settingsData.set(key, value);
                console.log('Not an OBS setting!');
        }
    
        // return the value to renderer process for display
        return value;
    });
    
    function validateSetting(key, value) {
        if (SETTINGS_DATA_SCHEMA[key]['type'] === 'boolean') {
            if (typeof(value) !== 'boolean') {
                value = SETTINGS_DATA_DEFAULTS[key];
            }
        }
        else {
            if (SETTINGS_DATA_SCHEMA[key]['type'] === 'number') {
                if (isNaN(value)) {
                    value = SETTINGS_DATA_DEFAULTS[key];
                }
                else {
                    if (SETTINGS_DATA_SCHEMA[key]['enum']) {
                        if (!SETTINGS_DATA_SCHEMA[key]['enum'].includes(Number(value))) {
                            value = SETTINGS_DATA_DEFAULTS[key];
                        }
                        else {
                            value = Number(value);
                        }
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
                                value = Number(value);
                            }
                        }
                    }
                }
            }
            else {
                if (typeof(value) !== 'string') {
                    value = SETTINGS_DATA_DEFAULTS[key];
                }
                else {
                    if (SETTINGS_DATA_SCHEMA[key]['enum']) {
                        if (!SETTINGS_DATA_SCHEMA[key]['enum'].includes(value)) {
                            value = SETTINGS_DATA_DEFAULTS[key];
                        }
                    }
                }
            }
        }

        return value;
    }

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
