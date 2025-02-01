// ES6 imports
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
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
    ACTIVE_DIR, DEF_CAPS_DIR, DEF_CLIPS_DIR, CAPS_THUMBNAIL_DIR, CLIPS_THUMBNAIL_DIR, OBS_EXECUTABLE_PATH, 
    SCENE_NAME, SPKR_INPUT_NAME, MIC_INPUT_NAME, 
    STGS_DATA_DEFAULTS, STGS_DATA_SCHEMA, 
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
import { togAutoRec } from './mainWindow.js';
import { get } from 'http';

export { initMainSettings };

async function initMainSettings() {
    await initStgs();
    initStgsL();
}

async function initStgs() {
    // attempt to load the stgs
    try {
        data['stgs'] = new Store({ defaults: STGS_DATA_DEFAULTS, schema: STGS_DATA_SCHEMA });
    }
    catch (error) {
        // error will occur if the file cannot be read, has corrupted values, or has invalid values (which should only occur if the user manually tampered with it)
        console.log('Error initializing Store: ', error);

        try {
            // delete the corrupted file
            unlinkSync(path.join(app.getPath('userData'), 'config.json'));
            console.log('config.json deleted.');

            // recreate the stgs with the default values
            data['stgs'] = new Store({ defaults: STGS_DATA_DEFAULTS, schema: STGS_DATA_SCHEMA });
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

    // set caps path
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFilePath', parameterValue: data['stgs'].get('capturesPath') }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set format
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFormat2', parameterValue: data['stgs'].get('capturesFormat') }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set encoder
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecEncoder', parameterValue: data['stgs'].get('capturesEncoder') }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set recording width
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCX', parameterValue: `${data['stgs'].get('capturesWidth')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCX', parameterValue: `${data['stgs'].get('capturesWidth')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set recording height
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCY', parameterValue: `${data['stgs'].get('capturesHeight')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCY', parameterValue: `${data['stgs'].get('capturesHeight')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set framerate
    await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'FPSInt', parameterValue: `${data['stgs'].get('capturesFramerate')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    // set bitrate
    try {
        let recordEncoderData;

        if (data['stgs'].get('capturesEncoder') == 'obs_x264') {
            recordEncoderData = { 'bitrate': data['stgs'].get('capturesBitrate') };
        }
        else {
            recordEncoderData = { 'rate_control': 'CBR', 'bitrate': data['stgs'].get('capturesBitrate') };
        }
        writeFileSync(path.join(ACTIVE_DIR, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json'), JSON.stringify(recordEncoderData), { encoding: 'utf8', mode: 0o644 });
        console.log('File has been written successfully with options');
    } 
    catch (error) {
        console.error('Error writing to file: ', error);
    }


    // INPUT STUFF HERE
    data['devices'] = await getDevices();
    data['disps'] = getDisps();

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

    // SPKR
    if (data['inputs'].some(input => input['inputName'] === 'Speaker Input'))
    {
        uuid['spkrInput'] = data['inputs'][data['inputs'].findIndex(input => input['inputName'] === 'Speaker Input')]['inputUuid'];
    }
    else {
        uuid['spkrInput'] = (await attemptAsyncFunction(async () => webSocketSend('CreateInput', { sceneName: 'CapCha', sceneUuid: uuid['scenes'], inputName: 'Speaker Input', inputKind: 'wasapi_output_capture', inputSettings: {}, sceneItemEnabled: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS))['responseData']['inputUuid'];
    }

    if (data['stgs'].get('speaker') !== 'Default') {
        if (data['stgs'].get('speaker') in data['devices']['outputs']) {
            await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['spkrInput'], inputSettings: { device_id: data['devices']['outputs'][data['stgs'].get('speaker')] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        }
        else {
            data['stgs'].set('spkr', 'Default');
            await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['spkrInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        }
    }
    else {
        await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['spkrInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    }

    await attemptAsyncFunction(async () => webSocketSend('SetInputVolume', { inputName: 'Speaker Input', inputUuid: uuid['spkrInput'], inputVolumeDb: data['stgs'].get('speakerVol') * 100 - 100 }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);

    // MIC
    if (data['inputs'].some(input => input['inputName'] === 'Microphone Input'))
    {
        uuid['micInput'] = data['inputs'][data['inputs'].findIndex(input => input['inputName'] === 'Microphone Input')]['inputUuid'];
    }
    else {
        uuid['micInput'] = (await attemptAsyncFunction(async () => webSocketSend('CreateInput', { sceneName: 'CapCha', sceneUuid: uuid['scenes'], inputName: 'Microphone Input', inputKind: 'wasapi_input_capture', inputSettings: {}, sceneItemEnabled: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS))['responseData']['inputUuid'];
    }

    if (data['stgs'].get('microphone') !== 'Default') {
        if (data['stgs'].get('microphone') in data['devices']['inputs']) {
            await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuid['micInput'], inputSettings: { device_id: data['devices']['inputs'][data['stgs'].get('microphone')] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        }
        else {
            data['stgs'].set('mic', 'Default');
            await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuid['micInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        }
    }
    else {
        await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuid['micInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    }

    await attemptAsyncFunction(async () => webSocketSend('SetInputVolume', { inputName: 'Microphone Input', inputUuid: uuid['micInput'], inputVolumeDb: data['stgs'].get('microphoneVol') * 100 - 100 }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);


    // DISP
    if (data['inputs'].some(input => input['inputName'] === 'Display Input'))
    {
        uuid['dispInput'] = data['inputs'][data['inputs'].findIndex(input => input['inputName'] === 'Display Input')]['inputUuid'];
    }
    else {
        uuid['dispInput'] = (await attemptAsyncFunction(async () => webSocketSend('CreateInput', { sceneName: 'CapCha', sceneUuid: uuid['scenes'], inputName: 'Display Input', inputKind: 'monitor_capture', inputSettings: {}, sceneItemEnabled: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS))['responseData']['inputUuid'];
    }


    if (data['stgs'].get('capturesDisp') in data['disps']) {
        await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Display Input', inputUuid: uuid['dispInput'], inputSettings: { method: 2, monitor_id: '\\\\?\\' + data['disps'][data['stgs'].get('capturesDisp')]['id'] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    }
    else {
        if (Object.keys(data['disps']).length === 0) {
            data['stgs'].set('capturesDisp', '');
        }
        else {
            data['stgs'].set('capturesDisp', Object.keys(data['disps'])[0]);
            await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Display Input', inputUuid: uuid['dispInput'], inputSettings: { method: 2, monitor_id: '\\\\?\\' + data['disps'][data['stgs'].get('capturesDisp')]['id'] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        }
    }


    // console.log(await attemptAsyncFunction(async () => webSocketSend('GetInputKindList', {} ), ATTEMPTS, FAST_DELAY_IN_MSECONDS));
    // console.log(await attemptAsyncFunction(async () => webSocketSend('GetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['speakerInput'] }), ATTEMPTS, FAST_DELAY_IN_MSECONDS));
    // console.log(await attemptAsyncFunction(async () => webSocketSend('GetInputSettings', { inputName: 'Display Capture', inputUuid: '4cded799-f32b-46ed-aba8-b66b5bd557e5' }), ATTEMPTS, FAST_DELAY_IN_MSECONDS));
    // console.log(data['inputs']);
    // console.log(data['devices']);
    // console.log(uuid);

    // await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Display Capture', inputUuid: '2dcf1a89-6149-445e-90c0-5e889ebf8873', inputSettings: { monitor_id: '\\\\?\\DISPLAY#GSM7766#5&44d6669&0&UID37120#{e6f07b5f-ee97-4a90-b076-33f57bf4eaa7}' }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
    console.log(getDisps());
}

function initStgsL() {
    // gets the entire settings object
    ipcMain.handle('stgs:getAllStgsData', (_) => { return data['stgs'].store });
    
    // sets the value of a specific stg
    ipcMain.handle('stgs:setStg', async (_, key, value) => {
        let canceled, filePaths;
        console.log(key, '1: ', value, ': ', typeof(value), ': ', STGS_DATA_SCHEMA[key]['enum']);

        value = validateStg(key, value);

        switch (key) {
            case 'capturesPath':
                ({ canceled, filePaths } = await dialog.showOpenDialog(instances['mainWindow'], { properties: ['openDirectory'] }));
        
                if (!canceled && filePaths[0] !== value) {
                    value = filePaths[0];
    
                    try {
                        // delete the thumbnail directory
                        await fs.rm(CAPS_THUMBNAIL_DIR, { recursive: true, force: true });
                
                        // recreate the thumbnail directory
                        await fs.mkdir(CAPS_THUMBNAIL_DIR);
                    }
                    catch {
                        console.error('Error reseting thumbnails directory!');
                    }
                }

                // should realistically never run
                if (!existsSync(value)) {
                    value = STGS_DATA_DEFAULTS[key];
                }

                console.log(key, ': ', value, ': ', typeof(value), ': ', STGS_DATA_SCHEMA[key]['enum']);
                data['stgs'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFilePath', parameterValue: data['stgs'].get('capturesPath') }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;
            
            case 'clipsPath':
                ({ canceled, filePaths } = await dialog.showOpenDialog(instances['mainWindow'], { properties: ['openDirectory'] }));
        
                if (!canceled && filePaths[0] !== value) {
                    value = filePaths[0];
    
                    try {
                        // delete the thumbnail directory
                        await fs.rm(CLIPS_THUMBNAIL_DIR, { recursive: true, force: true });
                
                        // recreate the thumbnail directory
                        await fs.mkdir(CLIPS_THUMBNAIL_DIR);
                    }
                    catch {
                        console.error('Error reseting thumbnails directory!');
                    }
                }

                // should realistically never run
                if (!existsSync(value)) {
                    value = STGS_DATA_DEFAULTS[key];
                }

                console.log(key, ': ', value, ': ', typeof(value), ': ', STGS_DATA_SCHEMA[key]['enum']);
                data['stgs'].set(key, value);
                break;

            case 'capturesFormat':
                console.log(key, ': ', value, ': ', typeof(value), ': ', STGS_DATA_SCHEMA[key]['enum']);
                data['stgs'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecFormat2', parameterValue: data['stgs'].get('capturesFormat') }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;

            case 'capturesEncoder':
                data['stgs'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'AdvOut', parameterName: 'RecEncoder', parameterValue: value }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);

                try {
                    let recordEncoderData;
            
                    if (value == 'obs_x264') {
                        recordEncoderData = { 'bitrate': data['stgs'].get('capturesBitrate') };
                    }
                    else {
                        recordEncoderData = { 'rate_control': 'CBR', 'bitrate': data['stgs'].get('capturesBitrate') };
                    }
                    writeFileSync(path.join(ACTIVE_DIR, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json'), JSON.stringify(recordEncoderData), { encoding: 'utf8', mode: 0o644 });
                    console.log('File has been written successfully with options');

                    console.log('REAPPLIED BITRATE: ', data['stgs'].get('capturesBitrate'));
                } 
                catch (error) {
                    console.error('Error writing to file: ', error);
                }
                break;

            case 'capturesWidth':
                console.log(key, ': ', value, ': ', typeof(value), ': ', STGS_DATA_SCHEMA[key]['enum']);
                data['stgs'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCX', parameterValue: `${data['stgs'].get('capturesWidth')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCX', parameterValue: `${data['stgs'].get('capturesWidth')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;

            case 'capturesHeight':
                console.log(key, ': ', value, ': ', typeof(value), ': ', STGS_DATA_SCHEMA[key]['enum']);
                data['stgs'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'BaseCY', parameterValue: `${data['stgs'].get('capturesHeight')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'OutputCY', parameterValue: `${data['stgs'].get('capturesHeight')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;

            case 'capturesFramerate':
                console.log(key, ': ', value, ': ', typeof(value), ': ', STGS_DATA_SCHEMA[key]['enum']);
                data['stgs'].set(key, value);

                await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'FPSInt', parameterValue: `${data['stgs'].get('capturesFramerate')}` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;

            case 'capturesBitrate':
                try {
                    let recordEncoderData;
            
                    if (data['stgs'].get('capturesEncoder') == 'obs_x264') {
                        recordEncoderData = { 'bitrate': value };
                    }
                    else {
                        recordEncoderData = { 'rate_control': 'CBR', 'bitrate': value };
                    }
                    writeFileSync(path.join(ACTIVE_DIR, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json'), JSON.stringify(recordEncoderData), { encoding: 'utf8', mode: 0o644 });
                    console.log('File has been written successfully with options');

                    console.log(key, ': ', value, ': ', typeof(value), ': ', STGS_DATA_SCHEMA[key]['enum']);
                    data['stgs'].set(key, value);
                } 
                catch (error) {
                    console.error('Error writing to file: ', error);
                }
                break;
            
            case 'autoRecord':
                data['stgs'].set(key, value);
                togAutoRec();
                break;

            case 'capturesDisp':
                data['stgs'].set(key, value);
                await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Display Input', inputUuid: uuid['dispInput'], inputSettings: { method: 2, monitor_id: '\\\\?\\' + data['disps'][data['stgs'].get('capturesDisp')]['id'] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                break;

            case 'speaker':
                data['stgs'].set(key, value);

                if (data['stgs'].get('speaker') !== 'Default') {
                    await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['spkrInput'], inputSettings: { device_id: data['devices']['outputs'][data['stgs'].get('speaker')] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                }
                else {
                    await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuid['spkrInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                }
                break;

            case 'speakerVol':
                data['stgs'].set(key, value);
                await attemptAsyncFunction(async () => webSocketSend('SetInputVolume', { inputName: 'Speaker Input', inputUuid: uuid['spkrInput'], inputVolumeDb: value * 100 - 100 }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                
                break;

            case 'microphone':
                data['stgs'].set(key, value);
            
                if (data['stgs'].get('microphone') !== 'Default') {
                    await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuid['micInput'], inputSettings: { device_id: data['devices']['inputs'][data['stgs'].get('microphone')] }, overlay: true }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                }
                else {
                    await attemptAsyncFunction(async () => webSocketSend('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuid['micInput'], inputSettings: { }, overlay: false }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                }

                break;

            case 'microphoneVol':
                data['stgs'].set(key, value);
                await attemptAsyncFunction(async () => webSocketSend('SetInputVolume', { inputName: 'Microphone Input', inputUuid: uuid['micInput'], inputVolumeDb: value * 100 - 100 }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
                
                break;

            default:
                console.log(key, '2: ', value, ': ', typeof(value), ': ', STGS_DATA_SCHEMA[key]['enum']);
                data['stgs'].set(key, value);
                console.log('Not an OBS setting!');
        }
    
        // return the value to renderer process for disp
        return value;
    });

    ipcMain.handle('stgs:getAllDevicesData', (_) => { return data['devices'] });

    ipcMain.handle('stgs:getAllDisplaysData', (_) => { return data['disps'] });



    ipcMain.handle('files:getAllDirData', async (_, isCaps) => {
        // return Promise.reject(new Error("Simulated error for testing"));

        // get the save location stored in the settings
        const dir = isCaps ? data['stgs'].get('capturesPath') : data['stgs'].get('clipsPath');
    
        // make the thumbnail directory and video directory (latter should already exist)
        await Promise.all([
            fs.mkdir(isCaps ? CAPS_THUMBNAIL_DIR : CLIPS_THUMBNAIL_DIR, { recursive: true }),
            fs.mkdir(dir, { recursive: true })
        ]);
    
        // read the video directory for files
        const files = await fs.readdir(dir);
    


        // filter by video extensions
        const videos = files.filter(file =>
            ['.mp4', '.mkv'].includes(path.extname(file).toLowerCase())
        );
    
        // get video meta data and thumbnail
        const videosData = await Promise.all(
            videos.map(async video => {
                try {
                    const videoName = path.parse(video).name;
                    const videoPath = path.join(dir, video);
    
                    const [videoMetaData, thumbnailPath] = await Promise.all([
                        fs.stat(videoPath),
                        path.join(isCaps ? CAPS_THUMBNAIL_DIR : CLIPS_THUMBNAIL_DIR, `${videoName}.png`)
                    ]);
    

                    const videoDuration = await new Promise((resolve, reject) => {
                        ffmpeg.ffprobe(videoPath, (error, metadata) => {
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
                            ffmpeg(videoPath)
                                .on('end', resolve)
                                .on('error', reject)
                                .screenshots({
                                    timestamps: ['50%'],
                                    filename: videoName,
                                    folder: isCaps ? CAPS_THUMBNAIL_DIR : CLIPS_THUMBNAIL_DIR,
                                    size: THUMBNAIL_SIZE
                                });
                        }), ATTEMPTS, SLOW_DELAY_IN_MSECONDS);
                    }
    
                    // return data on the video
                    return {
                        nameExt: video,
                        game: video.split('-')[1] === undefined ? 'EXTERNAL' : video.split('-')[0],
                        path: videoPath,
                        size: videoMetaData.size,
                        created: videoMetaData.birthtime, 
                        duration: videoDuration, 
                        thumbnailPath: thumbnailPath,
                    };
                }
                catch (error) {
                    console.log('Video Reading Error!:', error);
                    return null;
                }
            })
        );
    
        // return all the data on the videos
        return videosData.filter(videoData => videoData !== null);
    });

    async function getDirSize(dirPath) {
        let totalSize = 0;
      
        // Read all files and subdirectories in the directory
        const files = await fs.readdir(dirPath);

        // Loop through each file/subdirectory
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          
          const stats = await fs.stat(filePath);
          
          if (stats.isDirectory()) {
            // If it's a directory, recurse into it
            totalSize += await getDirSize(filePath);
          } 
          else {
                if (stats.isFile()) {
                // If it's a file, add its size
                totalSize += stats.size;
            }
            }
        }

        console.log('total: ', totalSize);
        return totalSize;
    }

    ipcMain.handle('files:getDirSize', async (_, isCaps) => {
        return isCaps ? (await getDirSize(data['stgs'].get('capturesPath'))) : (await getDirSize(data['stgs'].get('clipsPath')));
    });

    ipcMain.on('window:openDir', async (_, isCaps) => {
        try {
            const result = await shell.openPath(isCaps ? data['stgs'].get('capturesPath') : data['stgs'].get('clipsPath'));

            if (result) {
                console.error(`Error opening folder: ${result}`);
            } 
            else {
                console.log('Folder opened successfully!');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    })
}


















function validateStg(key, value) {
    if (STGS_DATA_SCHEMA[key]['type'] === 'boolean') {
        if (typeof(value) !== 'boolean') {
            value = STGS_DATA_DEFAULTS[key];
        }
    }
    else {
        if (STGS_DATA_SCHEMA[key]['type'] === 'number') {
            if (isNaN(value)) {
                value = STGS_DATA_DEFAULTS[key];
            }
            else {
                if (STGS_DATA_SCHEMA[key]['enum']) {
                    if (!STGS_DATA_SCHEMA[key]['enum'].includes(Number(value))) {
                        value = STGS_DATA_DEFAULTS[key];
                    }
                    else {
                        value = Number(value);
                    }
                }
                else {
                    if (value > STGS_DATA_SCHEMA[key]['maximum']) {
                        value = STGS_DATA_SCHEMA[key]['maximum'];
                    }
                    else {
                        if (value < STGS_DATA_SCHEMA[key]['minimum']) {
                            value = STGS_DATA_SCHEMA[key]['minimum'];
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
                value = STGS_DATA_DEFAULTS[key];
            }
            else {
                if (STGS_DATA_SCHEMA[key]['enum']) {
                    if (!STGS_DATA_SCHEMA[key]['enum'].includes(value)) {
                        value = STGS_DATA_DEFAULTS[key];
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

function getDisps() {
    try {
        return JSON.parse(readFileSync(path.join(ACTIVE_DIR, 'runtime-displays.json'), 'utf8'))
    } 
    catch (error) {
        console.error('Error reading file: ', error);
    }
}