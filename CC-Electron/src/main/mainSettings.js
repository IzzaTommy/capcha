// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync, readFileSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import psList from 'ps-list';
import { exec } from 'child_process';

import { 
    THUMBNAIL_SIZE, 
    ACTIVE_DIRECTORY, DEF_CAPTURES_DIRECTORY, DEF_CLIPS_DIRECTORY, CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, 
    PROGRAMS, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, 
    instances, flags, 
    data, state, uuid, 
    initMainVariables 
} from './mainVariables.js';
import { initMainWindow } from './mainWindow.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, webSocketSend } from './mainWebSocket.js';
import { attemptAsyncFunction } from './mainSharedFunctions.js';
import { toggleAutoRecord } from './mainWindow.js';

export { initMainSettings };

async function initMainSettings() {
    await initSettings();
    initSettingsL();
}

async function initSettings() {
    // attempt to load the settings
    try {
        data['settings'] = new Store({ defaults: SETTINGS_DATA_DEFAULTS, schema: SETTINGS_DATA_SCHEMA });
    }
    catch (error) {
        // error will occur if the file cannot be read, has corrupted values, or has invalid values (which should only occur if the user manually tampered with it)
        console.log('Error initializing Store: ', error);

        try {
            // delete the corrupted file
            unlinkSync(path.join(app.getPath('userData'), 'config.json'));
            console.log('config.json deleted.');

            // recreate the settings with the default values
            data['settings'] = new Store({ defaults: SETTINGS_DATA_DEFAULTS, schema: SETTINGS_DATA_SCHEMA });
            console.log('Store reinitialized with default settings.');
        } 
        catch (fsError) {
            console.error('Error deleting or resetting config file:', fsError);
        }
    }

    // create CapCha profile and set to CapCha profile
    if (!(await attemptAsyncFunction(() => webSocketSend('GetProfileList'), ATTEMPTS, FAST_DELAY_IN_MSECONDS))['responseData']['profiles'].includes('CapCha'))
    {
        await attemptAsyncFunction(() => webSocketSend('CreateProfile', { profileName: 'CapCha' }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    }
    await attemptAsyncFunction(() => webSocketSend('SetCurrentProfile', { profileName: 'CapCha' }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);

    // set basic settings
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Output', parameterName: 'Mode', parameterValue: 'Advanced' }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecType', parameterValue: 'Standard' }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'FPSType', parameterValue: '1' }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);

    // set captures path
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFilePath', parameterValue: data['settings'].get('capturesPath') }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set format
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFormat2', parameterValue: data['settings'].get('capturesFormat') }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set encoder
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecEncoder', parameterValue: data['settings'].get('capturesEncoder') }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set recording width
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCX', parameterValue: `${data['settings'].get('capturesWidth')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCX', parameterValue: `${data['settings'].get('capturesWidth')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set recording height
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCY', parameterValue: `${data['settings'].get('capturesHeight')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCY', parameterValue: `${data['settings'].get('capturesHeight')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set framerate
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'FPSInt', parameterValue: `${data['settings'].get('capturesFramerate')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set bitrate
    try {
        let recordEncoderData;

        if (data['settings'].get('capturesEncoder') == 'obs_x264') {
            recordEncoderData = { 'bitrate': data['settings'].get('capturesBitrate') };
        }
        else {
            recordEncoderData = { 'rate_control': 'CBR', 'bitrate': data['settings'].get('capturesBitrate') };
        }
        writeFileSync(path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json'), JSON.stringify(recordEncoderData), { encoding: 'utf8', mode: 0o644 });
        console.log('File has been written successfully with options');
    } 
    catch (error) {
        console.error('Error writing to file: ', error);
    }


    // INPUT STUFF HERE
    data['devices'] = await getDevices();
    data['displays'] = getDisplays();

    // SCENE
    data['scenes'] = (await attemptAsyncFunction(() => webSocketSend('GetSceneList'), ATTEMPTS, FAST_DELAY_IN_MSECONDS))['responseData']['scenes'];
    // create CapCha scene and set to CapCha scene
    if (data['scenes'].some(scene => scene['sceneName'] === 'CapCha'))
    {
        uuid['scene'] = data['scenes'][data['scenes'].findIndex(scene => scene['sceneName'] === 'CapCha')]['sceneUuid'];
    }
    else {
        uuid['scene'] = (await attemptAsyncFunction(() => webSocketSend('CreateScene', { sceneName: 'CapCha' }), ATTEMPTS, FAST_DELAY_IN_MSECONDS))['responseData']['sceneUuid'];
    }
    await attemptAsyncFunction(async () => webSocketSend('SetCurrentProgramScene', { sceneName: 'CapCha', sceneUuid: uuid['scene'] }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    
    // INPUTS
    data['inputs'] = (await attemptAsyncFunction(() => webSocketSend('GetInputList', {}), ATTEMPTS, FAST_DELAY_IN_MSECONDS))['responseData']['inputs'];

    if (data['inputs'].some(input => input['inputName'] === 'Desktop Audio'))
    {
        await attemptAsyncFunction(async () => webSocketSend('SetInputMute', { inputName: 'Desktop Audio', inputUuid: data['inputs'][data['inputs'].findIndex(input => input['inputName'] === 'Desktop Audio')]['inputUuid'], inputMuted: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    }

    if (data['inputs'].some(input => input['inputName'] === 'Mic/Aux'))
    {
        await attemptAsyncFunction(async () => webSocketSend('SetInputMute', { inputName: 'Mic/Aux', inputUuid: data['inputs'][data['inputs'].findIndex(input => input['inputName'] === 'Mic/Aux')]['inputUuid'], inputMuted: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    }

    // SPEAKER
    if (data['inputs'].some(input => input['inputName'] === 'Speaker Input'))
    {
        uuid['speakerInput'] = data['inputs'][data['inputs'].findIndex(input => input['inputName'] === 'Speaker Input')]['inputUuid'];
    }
    else {
        uuid['speakerInput'] = (await attemptAsyncFunction(async () => webSocketSend('CreateInput', { sceneName: 'CapCha', sceneUuid: uuid['scenes'], inputName: 'Speaker Input', inputKind: 'wasapi_output_capture', inputSettings: {}, sceneItemEnabled: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS))['responseData']['inputUuid'];
    }

    if (data['settings'].get('speaker') !== 'Default') {
        if (data['settings'].get('speaker') in data['devices']['outputs']) {
            await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['speakerInput'], inputSettings: { device_id: data['devices']['outputs'][data['settings'].get('speaker')] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        }
        else {
            data['settings'].set('speaker', 'Default');
            await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['speakerInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        }
    }
    else {
        await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['speakerInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    }

    await attemptAsyncFunction(async () => webSocketSend('SetInputVolume', { inputName: 'Speaker Input', inputUuid: uuid['speakerInput'], inputVolumeDb: data['settings'].get('speakerVolume') * 100 - 100 }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);

    // MICROPHONE
    if (data['inputs'].some(input => input['inputName'] === 'Microphone Input'))
    {
        uuid['microphoneInput'] = data['inputs'][data['inputs'].findIndex(input => input['inputName'] === 'Microphone Input')]['inputUuid'];
    }
    else {
        uuid['microphoneInput'] = (await attemptAsyncFunction(async () => webSocketSend('CreateInput', { sceneName: 'CapCha', sceneUuid: uuid['scenes'], inputName: 'Microphone Input', inputKind: 'wasapi_input_capture', inputSettings: {}, sceneItemEnabled: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS))['responseData']['inputUuid'];
    }

    if (data['settings'].get('microphone') !== 'Default') {
        if (data['settings'].get('microphone') in data['devices']['inputs']) {
            await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuid['microphoneInput'], inputSettings: { device_id: data['devices']['inputs'][data['settings'].get('microphone')] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        }
        else {
            data['settings'].set('microphone', 'Default');
            await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuid['microphoneInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        }
    }
    else {
        await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuid['microphoneInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    }

    await attemptAsyncFunction(async () => webSocketSend('SetInputVolume', { inputName: 'Microphone Input', inputUuid: uuid['microphoneInput'], inputVolumeDb: data['settings'].get('microphoneVolume') * 100 - 100 }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);


    // DISPLAY
    if (data['inputs'].some(input => input['inputName'] === 'Display Input'))
    {
        uuid['displayInput'] = data['inputs'][data['inputs'].findIndex(input => input['inputName'] === 'Display Input')]['inputUuid'];
    }
    else {
        uuid['displayInput'] = (await attemptAsyncFunction(async () => webSocketSend('CreateInput', { sceneName: 'CapCha', sceneUuid: uuid['scenes'], inputName: 'Display Input', inputKind: 'monitor_capture', inputSettings: {}, sceneItemEnabled: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS))['responseData']['inputUuid'];
    }


    if (data['settings'].get('capturesDisplay') in data['displays']) {
        await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Display Input', inputUuid: uuid['displayInput'], inputSettings: { method: 0, monitor_id: '\\\\?\\' + data['displays'][data['settings'].get('capturesDisplay')]['id'] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    }
    else {
        if (Object.keys(data['displays']).length === 0) {
            data['settings'].set('capturesDisplay', '');
        }
        else {
            data['settings'].set('capturesDisplay', Object.keys(data['displays'])[0]);
            await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Display Input', inputUuid: uuid['displayInput'], inputSettings: { method: 0, monitor_id: '\\\\?\\' + data['displays'][data['settings'].get('capturesDisplay')]['id'] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        }
    }


    // console.log(await attemptAsyncFunction(async () => webSocketSend('GetInputKindList', {} ), ATTEMPTS, FAST_DELAY_IN_MSECONDS));
    // console.log(await attemptAsyncFunction(async () => webSocketSend('GetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['speakerInput'] }), ATTEMPTS, FAST_DELAY_IN_MSECONDS));
    // console.log(await attemptAsyncFunction(async () => webSocketSend('GetInputSettings', { inputName: 'Display Capture', inputUuid: '4cded799-f32b-46ed-aba8-b66b5bd557e5' }), ATTEMPTS, FAST_DELAY_IN_MSECONDS));
    // console.log(data['inputs']);
    // console.log(data['devices']);
    // console.log(uuid);

    // await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Display Capture', inputUuid: '2dcf1a89-6149-445e-90c0-5e889ebf8873', inputSettings: { monitor_id: '\\\\?\\DISPLAY#GSM7766#5&44d6669&0&UID37120#{e6f07b5f-ee97-4a90-b076-33f57bf4eaa7}' }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    console.log(getDisplays());
}

function initSettingsL() {
    // gets the entire settings object
    ipcMain.handle('settings:getAllSettingsData', (_) => { return data['settings'].store });
    
    // sets the value of a specific setting
    ipcMain.handle('settings:setSetting', async (_, key, value) => {
        let canceled, filePaths;
        console.log(key, '1: ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);

        value = validateSetting(key, value);

        switch (key) {
            case 'capturesPath':
                ({ canceled, filePaths } = await dialog.showOpenDialog(instances['mainWindow'], { properties: ['openDirectory'] }));
        
                if (!canceled && filePaths[0] !== value) {
                    value = filePaths[0];
    
                    try {
                        // delete the thumbnail directory
                        await fs.rm(CAPTURES_THUMBNAIL_DIRECTORY, { recursive: true, force: true });
                
                        // recreate the thumbnail directory
                        await fs.mkdir(CAPTURES_THUMBNAIL_DIRECTORY);
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
                data['settings'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFilePath', parameterValue: data['settings'].get('capturesPath') }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;
            
            case 'clipsPath':
                ({ canceled, filePaths } = await dialog.showOpenDialog(instances['mainWindow'], { properties: ['openDirectory'] }));
        
                if (!canceled && filePaths[0] !== value) {
                    value = filePaths[0];
    
                    try {
                        // delete the thumbnail directory
                        await fs.rm(CLIPS_THUMBNAIL_DIRECTORY, { recursive: true, force: true });
                
                        // recreate the thumbnail directory
                        await fs.mkdir(CLIPS_THUMBNAIL_DIRECTORY);
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
                data['settings'].set(key, value);
                break;

            case 'capturesFormat':
                console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                data['settings'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFormat2', parameterValue: data['settings'].get('capturesFormat') }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;

            case 'capturesEncoder':
                data['settings'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecEncoder', parameterValue: value }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);

                try {
                    let recordEncoderData;
            
                    if (value == 'obs_x264') {
                        recordEncoderData = { 'bitrate': data['settings'].get('capturesBitrate') };
                    }
                    else {
                        recordEncoderData = { 'rate_control': 'CBR', 'bitrate': data['settings'].get('capturesBitrate') };
                    }
                    writeFileSync(path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json'), JSON.stringify(recordEncoderData), { encoding: 'utf8', mode: 0o644 });
                    console.log('File has been written successfully with options');

                    console.log('REAPPLIED BITRATE: ', data['settings'].get('capturesBitrate'));
                } 
                catch (error) {
                    console.error('Error writing to file: ', error);
                }
                break;

            case 'capturesWidth':
                console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                data['settings'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCX', parameterValue: `${data['settings'].get('capturesWidth')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCX', parameterValue: `${data['settings'].get('capturesWidth')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;

            case 'capturesHeight':
                console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                data['settings'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCY', parameterValue: `${data['settings'].get('capturesHeight')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCY', parameterValue: `${data['settings'].get('capturesHeight')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;

            case 'capturesFramerate':
                console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                data['settings'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'FPSInt', parameterValue: `${data['settings'].get('capturesFramerate')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;

            case 'capturesBitrate':
                try {
                    let recordEncoderData;
            
                    if (data['settings'].get('capturesEncoder') == 'obs_x264') {
                        recordEncoderData = { 'bitrate': value };
                    }
                    else {
                        recordEncoderData = { 'rate_control': 'CBR', 'bitrate': value };
                    }
                    writeFileSync(path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json'), JSON.stringify(recordEncoderData), { encoding: 'utf8', mode: 0o644 });
                    console.log('File has been written successfully with options');

                    console.log(key, ': ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                    data['settings'].set(key, value);
                } 
                catch (error) {
                    console.error('Error writing to file: ', error);
                }
                break;
            
            case 'autoRecord':
                data['settings'].set(key, value);
                toggleAutoRecord();
                break;

            case 'capturesDisplay':
                data['settings'].set(key, value);
                await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Display Input', inputUuid: uuid['displayInput'], inputSettings: { method: 0, monitor_id: '\\\\?\\' + data['displays'][data['settings'].get('capturesDisplay')]['id'] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;

            case 'speaker':
                data['settings'].set(key, value);

                if (data['settings'].get('speaker') !== 'Default') {
                    await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['speakerInput'], inputSettings: { device_id: data['devices']['outputs'][data['settings'].get('speaker')] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                }
                else {
                    await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['speakerInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                }
                break;

            case 'speakerVolume':
                data['settings'].set(key, value);
                await attemptAsyncFunction(async () => webSocketSend('SetInputVolume', { inputName: 'Speaker Input', inputUuid: uuid['speakerInput'], inputVolumeDb: value * 100 - 100 }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                
                break;

            case 'microphone':
                data['settings'].set(key, value);
            
                if (data['settings'].get('microphone') !== 'Default') {
                    await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuid['microphoneInput'], inputSettings: { device_id: data['devices']['inputs'][data['settings'].get('microphone')] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                }
                else {
                    await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuid['microphoneInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                }

                break;

            case 'microphoneVolume':
                data['settings'].set(key, value);
                await attemptAsyncFunction(async () => webSocketSend('SetInputVolume', { inputName: 'Microphone Input', inputUuid: uuid['microphoneInput'], inputVolumeDb: value * 100 - 100 }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                
                break;

            default:
                console.log(key, '2: ', value, ': ', typeof(value), ': ', SETTINGS_DATA_SCHEMA[key]['enum']);
                data['settings'].set(key, value);
                console.log('Not an OBS setting!');
        }
    
        // return the value to renderer process for display
        return value;
    });
    



    ipcMain.handle('settings:getAllDevicesData', (_) => { return data['devices'] });

    ipcMain.handle('settings:getAllDisplaysData', (_) => { return data['displays'] });

    // gets all of the video files and meta data from the save location directory
    ipcMain.handle('files:getAllCapturesData', async (_) => {
        // return Promise.reject(new Error("Simulated error for testing"));

        // get the save location stored in the settings
        const directory = data['settings'].get('capturesPath');
    
        // make the thumbnail directory and video directory (latter should already exist)
        await Promise.all([
            fs.mkdir(CAPTURES_THUMBNAIL_DIRECTORY, { recursive: true }),
            fs.mkdir(directory, { recursive: true })
        ]);
    
        // read the video directory for files
        const files = await fs.readdir(directory);
    
        // filter by video extensions
        const captures = files.filter(file =>
            ['.mp4', '.mkv'].includes(path.extname(file).toLowerCase())
        );
    
        // get video meta data and thumbnail
        const capturesData = await Promise.all(
            captures.map(async capture => {
                try {
                    const captureName = path.parse(capture).name;
                    const capturePath = path.join(directory, capture);
    
                    const [captureMetaData, thumbnailPath] = await Promise.all([
                        fs.stat(capturePath),
                        path.join(CAPTURES_THUMBNAIL_DIRECTORY, `${captureName}.png`)
                    ]);
    

                    const captureDuration = await new Promise((resolve, reject) => {
                        ffmpeg.ffprobe(capturePath, (error, metadata) => {
                            if (error) {
                                return reject(error);
                            }
           
                            resolve(metadata.format.duration);
                        });
                    });

                    // create thumbnail if it does not exist
                    try {
                        await fs.access(thumbnailPath);
                    }
                    catch {
                        await attemptAsyncFunction(async () => await new Promise((resolve, reject) => {
                            ffmpeg(capturePath)
                                .on('end', resolve)
                                .on('error', reject)
                                .screenshots({
                                    timestamps: ['50%'],
                                    filename: captureName,
                                    folder: CAPTURES_THUMBNAIL_DIRECTORY,
                                    size: THUMBNAIL_SIZE
                                });
                        }), ATTEMPTS, SLOW_DELAY_IN_MSECONDS);
                    }
    
                    // return data on the video
                    return {
                        nameExt: capture,
                        game: capture.split('-')[0],
                        path: capturePath,
                        size: captureMetaData.size,
                        created: captureMetaData.birthtime, 
                        duration: captureDuration, 
                        thumbnailPath: thumbnailPath
                    };
                }
                catch (error) {
                    console.log('Video Reading Error!:', error);
                    return null;
                }
            })
        );
    
        // return all the data on the videos
        return capturesData.filter(captureData => captureData !== null).sort((a, b) => b.created - a.created);
    });

    // gets all of the video files and meta data from the save location directory
    ipcMain.handle('files:getAllClipsData', async (_) => {
        // return Promise.reject(new Error("Simulated error for testing"));

        // get the save location stored in the settings
        const directory = data['settings'].get('clipsPath');
    
        // make the thumbnail directory and video directory (latter should already exist)
        await Promise.all([
            fs.mkdir(CLIPS_THUMBNAIL_DIRECTORY, { recursive: true }),
            fs.mkdir(directory, { recursive: true })
        ]);
    
        // read the video directory for files
        const files = await fs.readdir(directory);
    
        // filter by video extensions
        const clips = files.filter(file =>
            ['.mp4', '.mkv'].includes(path.extname(file).toLowerCase())
        );
    
        // get video meta data and thumbnail
        const clipsData = await Promise.all(
            clips.map(async clip => {
                try {
                    const clipName = path.parse(clip).name;
                    const clipPath = path.join(directory, clip);
    
                    const [clipMetaData, thumbnailPath] = await Promise.all([
                        fs.stat(clipPath),
                        path.join(CLIPS_THUMBNAIL_DIRECTORY, `${clipName}.png`)
                    ]);
    

                    const clipDuration = await new Promise((resolve, reject) => {
                        ffmpeg.ffprobe(clipPath, (error, metadata) => {
                            if (error) {
                                return reject(error);
                            }
           
                            resolve(metadata.format.duration);
                        });
                    });

                    // create thumbnail if it does not exist
                    try {
                        await fs.access(thumbnailPath);
                    }
                    catch {
                        await attemptAsyncFunction(async () => await new Promise((resolve, reject) => {
                            ffmpeg(clipPath)
                                .on('end', resolve)
                                .on('error', reject)
                                .screenshots({
                                    timestamps: ['50%'],
                                    filename: clipName,
                                    folder: CLIPS_THUMBNAIL_DIRECTORY,
                                    size: THUMBNAIL_SIZE
                                });
                        }), ATTEMPTS, SLOW_DELAY_IN_MSECONDS);
                    }
    
                    // return data on the video
                    return {
                        nameExt: clip,
                        game: clip.split('-')[0],
                        path: clipPath,
                        size: clipMetaData.size,
                        created: clipMetaData.birthtime, 
                        duration: clipDuration, 
                        thumbnailPath: thumbnailPath
                    };
                }
                catch (error) {
                    console.log('Video Reading Error!:', error);
                    return null;
                }
            })
        );
    
        // return all the data on the videos
        return clipsData.filter(clipData => clipData !== null).sort((a, b) => b.created - a.created);
    });
}

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

function getDevices() {
    return new Promise((resolve, reject) => {
        const command = `
            Get-CimInstance Win32_PnPEntity |
            Where-Object { $_.PNPClass -eq 'AudioEndpoint' } |
            Select-Object Name, DeviceID |
            ConvertTo-Json -Compress
        `;
        
        exec(command, { shell: 'powershell.exe' }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                const devicesArray = JSON.parse(stdout);
                const devices = { inputs: {}, outputs: {} };

                devicesArray.forEach(device => {
                    const name = device.Name;
                    const deviceId = device.DeviceID.replace(/^SWD\\MMDEVAPI\\/, '').trim().toLowerCase();

                    if (/microphone|line in/i.test(name)) {
                        devices.inputs[name] = deviceId;
                    } else if (/speakers|line out|headphones/i.test(name)) {
                        devices.outputs[name] = deviceId;
                    } else {
                        devices.outputs[name] = deviceId;
                    }
                });

                resolve(devices);
            } 
            catch (parseError) {
                reject(parseError);
            }
        });
    });
}

function getDisplays() {
    try {
        return JSON.parse(readFileSync(path.join(ACTIVE_DIRECTORY, 'runtime-displays.json'), 'utf8'))
    } 
    catch (error) {
        console.error('Error reading file: ', error);
    }
}