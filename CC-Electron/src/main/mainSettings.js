/**
 * Module for initializing the settings for the main process
 * 
 * @module mainSettings
 * @requires child_process
 * @requires chokidar
 * @requires electron
 * @requires electron-store
 * @requires extract-file-icon
 * @requires fluent-ffmpeg
 * @requires fs
 * @requires path
 * @requires ps-list
 * @requires util
 * @requires mainVariables
 * @requires mainGeneral
 * @requires mainWebSocket
 */
import { exec } from 'child_process';
import chokidar from 'chokidar';
import { dialog, ipcMain, shell } from 'electron';
import Store from 'electron-store';
import extract from 'extract-file-icon';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import psList from 'ps-list';
import { promisify } from 'util'
import { 
    TERMINATION_SIGNAL, ACTIVE_DIRECTORY, MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, MAIN_WINDOW_ICON_PATH, PRELOAD_PATH, INDEX_PATH, 
    CLIP_FRAMERATE, CLIP_VIDEO_BITRATE, CLIP_AUDIO_CODEC, CLIP_AUDIO_BITRATE, CLIP_AUDIO_CHANNELS, CLIP_THREADS, CLIP_VIDEO_CODEC, 
    CHECK_PROGRAMS_DELAY, TIME_PAD, EVENT_PAD, LOGS_PATH, LOGS_DIV, 
    OBS_EXECUTABLE_PATH, CAPTURES_DATE_FORMAT, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, THUMBNAIL_SIZE, 
    SETTINGS_CONFIG_PATH, SETTINGS_DATA_SCHEMA, SETTINGS_DATA_DEFS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    data, flags, insts, states, uuids 
} from './mainVariables.js';
import { initMainGen, createClip, getVideoDate, getLogDate, logProc, atmpAsyncFunc } from './mainGeneral.js';
import { initMainWebSocket, webSocketReq, webSocketBatchReq } from './mainWebSocket.js';

/**
 * @exports initMainStgs
 */
export { initMainStgs };

/**
 * Initializes the settings for electron-store and OBS
 */
async function initMainStgs() {
    await atmpAsyncFunc(() => initStgs());
    initStgsL();
}

/**
 * Initializes the settings
 */
async function initStgs() {
    [data['devs'], data['disps']] = await Promise.all([getDevs(), getDisps()]);

    // try to load the settings for electron-store
    try {
        data['stgs'] = new Store({ 'defaults': SETTINGS_DATA_DEFS, 'schema': SETTINGS_DATA_SCHEMA });
    }
    catch (error) {
        // error will occur if the file cannot be read, has corrupted values, or has invalid values (which should only occur if the user manually tampered with it)
        logProc('Settings', 'ERROR', 'Configuration file cannot be read', false);  // boolean1 isFinalMsg
        logProc('Settings', 'ERROR', `Error message: ${error}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        try {
            // delete the corrupted file
            atmpAsyncFunc(() => fs.unlink(SETTINGS_CONFIG_PATH));
            logProc('Settings', 'ERROR', 'Deleting the corrupt configuration file', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

            // recreate the stgs with the default values
            data['stgs'] = new Store({ 'defaults': SETTINGS_DATA_DEFS, 'schema': SETTINGS_DATA_SCHEMA });
            logProc('Settings', 'ERROR', 'Reinitializing settings with default values', true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        } 
        catch (error) {
            logProc('Settings', 'ERROR', 'Could not delete the corrupt configuration file', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            logProc('Settings', 'ERROR', `Error message: ${error}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        }
    }

    // create the captures and clips directory watchers to watch for any file updates
    states['capsWatch'] = chokidar.watch(data['stgs'].get('capturesDirectory'), { 'ignored': (filePath, stats) => stats?.isFile() && !SETTINGS_DATA_SCHEMA['capturesFormat']['enum'].includes(path.extname(filePath).toLowerCase().replace('.', '')), 'ignoreInitial': true, 'awaitWriteFinish': true, 'depth': 0});
    states['clipsWatch'] = chokidar.watch(data['stgs'].get('clipsDirectory'), { 'ignored': (filePath, stats) => stats?.isFile() && !SETTINGS_DATA_SCHEMA['clipsFormat']['enum'].includes(path.extname(filePath).toLowerCase().replace('.', '')), 'ignoreInitial': true, 'awaitWriteFinish': true, 'depth': 0});

    loadWatchL(true);  // boolean1 isCaps
    loadWatchL(false);  // boolean1 isCaps

    // create the CapCha profile if it does not exist
    if (!(await atmpAsyncFunc(() => webSocketReq('GetProfileList')))['responseData']['profiles'].includes('CapCha')) {
        // set OBS to the CapCha profile
        await atmpAsyncFunc(() => webSocketReq('CreateProfile', { 'profileName': 'CapCha' }));
    }
    
    // set settings as a batch request
    await atmpAsyncFunc(() => webSocketBatchReq(false, 0, [
        // set the profile to the CapCha profile
        {
            'requestType': 'SetCurrentProfile', 
            'requestData': { 'profileName': 'CapCha' } 
        }, 
        // set the setting, recording, and FPS type to accept the right values
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Output', 'parameterName': 'Mode', 'parameterValue': 'Advanced' } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'AdvOut', 'parameterName': 'RecType', 'parameterValue': 'Standard' } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'FPSType', 'parameterValue': '1' } 
        }, 
        // set the recording path, format, encoder, width, height, and FPS
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'AdvOut', 'parameterName': 'RecFilePath', 'parameterValue': data['stgs'].get('capturesDirectory') } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'AdvOut', 'parameterName': 'RecFormat2', 'parameterValue': data['stgs'].get('capturesFormat') } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'AdvOut', 'parameterName': 'RecEncoder', 'parameterValue': data['stgs'].get('capturesEncoder') } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'BaseCX', 'parameterValue': `${data['stgs'].get('capturesWidth')}` } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'OutputCX', 'parameterValue': `${data['stgs'].get('capturesWidth')}` } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'BaseCY', 'parameterValue': `${data['stgs'].get('capturesHeight')}` } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'OutputCY', 'parameterValue': `${data['stgs'].get('capturesHeight')}` } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'FPSInt', 'parameterValue': `${data['stgs'].get('capturesFramerate')}` } 
        }, 
    ]));

    // set bitrate by manipulating the file with bitrate information
    try {
        await atmpAsyncFunc(() => fs.writeFile(RECORD_ENCODER_PATH, JSON.stringify(data['stgs'].get('capturesEncoder') == 'obs_x264' ? { 'bitrate': data['stgs'].get('capturesBitrate') } : { 'rate_control': 'CBR', 'bitrate': data['stgs'].get('capturesBitrate') })));
    } 
    catch (error) {
        logProc('Settings', 'ERROR', 'Could not set the bitrate', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        logProc('Settings', 'ERROR', `Error message: ${error}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    }

    // get the list of scenes and inputs
    data['scenes'] = (await atmpAsyncFunc(() => webSocketReq('GetSceneList')))['responseData']['scenes'];
    data['inps'] = (await atmpAsyncFunc(() => webSocketReq('GetInputList', { })))['responseData']['inputs'];

    // create the CapCha scene if it doesn't exist
    uuids['scene'] = data['scenes'].some(scene => scene['sceneName'] === 'CapCha') ? data['scenes'][data['scenes'].findIndex(scene => scene['sceneName'] === 'CapCha')]['sceneUuid'] : (await atmpAsyncFunc(() => webSocketReq('CreateScene', { sceneName: 'CapCha' })))['responseData']['sceneUuid'];

    // set the scene to the CapCha scene
    await atmpAsyncFunc(async () => webSocketReq('SetCurrentProgramScene', { sceneName: 'CapCha', sceneUuid: uuids['scene'] }));
    
    // mute the desktop audio (they appear by default and will be redundant)
    if (data['inps'].some(input => input['inputName'] === 'Desktop Audio')) {
        await atmpAsyncFunc(async () => webSocketReq('SetInputMute', { inputName: 'Desktop Audio', inputUuid: data['inps'][data['inps'].findIndex(input => input['inputName'] === 'Desktop Audio')]['inputUuid'], inputMuted: true }));
    }

    // mute the mic/aux (they appear by default and will be redundant)
    if (data['inps'].some(input => input['inputName'] === 'Mic/Aux')) {
        await atmpAsyncFunc(async () => webSocketReq('SetInputMute', { inputName: 'Mic/Aux', inputUuid: data['inps'][data['inps'].findIndex(input => input['inputName'] === 'Mic/Aux')]['inputUuid'], inputMuted: true }));
    }

    // create the speaker input if it does not exist
    uuids['spkInp'] = data['inps'].some(input => input['inputName'] === 'Speaker Input') ? data['inps'][data['inps'].findIndex(input => input['inputName'] === 'Speaker Input')]['inputUuid'] : (await atmpAsyncFunc(async () => webSocketReq('CreateInput', { sceneName: 'CapCha', sceneUuid: uuids['scenes'], inputName: 'Speaker Input', inputKind: 'wasapi_output_capture', inputSettings: { }, sceneItemEnabled: true })))['responseData']['inputUuid'];

    // check if the speaker is not the default speaker and the speaker is currently available
    if (data['stgs'].get('speaker') !== 'Default' && data['stgs'].get('speaker') in data['devs']['outs']) {
        // set the speaker to the device in the settings
        await atmpAsyncFunc(async () => webSocketReq('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuids['spkInp'], inputSettings: { device_id: data['devs']['outs'][data['stgs'].get('speaker')] }, overlay: true }));
    }
    // else, set the speaker to the default
    else {
        data['stgs'].set('speaker', 'Default');
        await atmpAsyncFunc(async () => webSocketReq('SetInputSettings', { inputName: 'Speaker Input', inputUuid: uuids['spkInp'], inputSettings: { }, overlay: false }));
    }

    // set the speaker volume
    await atmpAsyncFunc(async () => webSocketReq('SetInputVolume', { inputName: 'Speaker Input', inputUuid: uuids['spkInp'], inputVolumeDb: data['stgs'].get('speakerVolume') * 100 - 100 }));

    // create the microphone input if it does not exist
    uuids['micInp'] = data['inps'].some(input => input['inputName'] === 'Microphone Input') ? data['inps'][data['inps'].findIndex(input => input['inputName'] === 'Microphone Input')]['inputUuid'] : (await atmpAsyncFunc(async () => webSocketReq('CreateInput', { sceneName: 'CapCha', sceneUuid: uuids['scenes'], inputName: 'Microphone Input', inputKind: 'wasapi_input_capture', inputSettings: { }, sceneItemEnabled: true })))['responseData']['inputUuid'];
    
    // check if the microphone is not the default microphone and the microphone is currently available
    if (data['stgs'].get('microphone') !== 'Default' && data['stgs'].get('microphone') in data['devs']['inps']) {
        // set the microphone to the device in the settings
        await atmpAsyncFunc(async () => webSocketReq('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuids['micInp'], inputSettings: { device_id: data['devs']['inps'][data['stgs'].get('microphone')] }, overlay: true }));
    }
    // else, set the microphone to the default
    else {
        data['stgs'].set('microphone', 'Default');
        await atmpAsyncFunc(async () => webSocketReq('SetInputSettings', { inputName: 'Microphone Input', inputUuid: uuids['micInp'], inputSettings: { }, overlay: false }));
    }

    // set the microphone volume
    await atmpAsyncFunc(async () => webSocketReq('SetInputVolume', { inputName: 'Microphone Input', inputUuid: uuids['micInp'], inputVolumeDb: data['stgs'].get('microphoneVolume') * 100 - 100 }));

    // create the display input if it does not exist
    uuids['dispInput'] = data['inps'].some(input => input['inputName'] === 'Display Input') ? data['inps'][data['inps'].findIndex(input => input['inputName'] === 'Display Input')]['inputUuid'] : (await atmpAsyncFunc(async () => webSocketReq('CreateInput', { sceneName: 'CapCha', sceneUuid: uuids['scenes'], inputName: 'Display Input', inputKind: 'monitor_capture', inputSettings: { }, sceneItemEnabled: true })))['responseData']['inputUuid'];

    // set the display to the device in the settings
    if (data['stgs'].get('capturesDisplay') in data['disps']) {
        await atmpAsyncFunc(async () => webSocketReq('SetInputSettings', { inputName: 'Display Input', inputUuid: uuids['dispInput'], inputSettings: { method: 2, monitor_id: '\\\\?\\' + data['disps'][data['stgs'].get('capturesDisplay')]['id'] }, overlay: true }));
    }
    else {
        // if the list of displays is empty, set the display to nothing
        if (Object.keys(data['disps']).length === 0) {
            data['stgs'].set('capturesDisplay', '');
        }
        // else, set the display to the first one in the list
        else {
            data['stgs'].set('capturesDisplay', Object.keys(data['disps'])[0]);
            await atmpAsyncFunc(async () => webSocketReq('SetInputSettings', { inputName: 'Display Input', inputUuid: uuids['dispInput'], inputSettings: { method: 2, monitor_id: '\\\\?\\' + data['disps'][data['stgs'].get('capturesDisplay')]['id'] }, overlay: true }));
        }
    }
}

/**
 * Initializes the settings listeners
 */
function initStgsL() {
    // on reqTogAutoRec, call togAutoRec
    ipcMain.on('stgs:reqTogAutoRec', togAutoRec); 

    // opens the directory
    ipcMain.on('stgs:openDir', async (_, isCaps) => {
        await atmpAsyncFunc(() => shell.openPath(data['stgs'].get(isCaps ? 'capturesDirectory' : 'clipsDirectory')));
    });

    // deletes the program from the programs list
    ipcMain.handle('stgs:delProg', (_, name) => {
        // get the programs list
        const progs = data['stgs'].get('programs');

        // delete the program and update the programs list
        delete progs[name];
        data['stgs'].set('programs', progs);

        // return if the program was removed or not
        return !(name in data['stgs'].get('programs'));
    });

    // gets the size and videos data for the directory
    ipcMain.handle('stgs:getAllDirData', async (_, isCaps) => {
        // get the captures or clips variable
        const frmtStr = isCaps ? 'capturesFormat' : 'clipsFormat';
        const dir = data['stgs'].get(isCaps ? 'capturesDirectory' : 'clipsDirectory');
        const tbnlDir = isCaps ? CAPTURES_THUMBNAIL_DIRECTORY : CLIPS_THUMBNAIL_DIRECTORY;
        // videos data, video count, corrupted video count, and size
        let videoCount = 0, corrCount = 0, size = 0;

        // ensures the thumbnail directory exists
        if (await atmpAsyncFunc(() => fs.access(tbnlDir))) {
            await atmpAsyncFunc(() => fs.mkdir(tbnlDir, { recursive: true }));  // don't need to check exist technically since recursive means no error on exist
        }
        
        // ensures the video directory exists
        if (await atmpAsyncFunc(() => fs.access(dir))) {
            await atmpAsyncFunc(() => fs.mkdir(dir, { recursive: true }));  // don't need to check exist technically since recursive means no error on exist
        }

        // read the video directory for files
        const files = await atmpAsyncFunc(() => fs.readdir(dir));

        // filter the files by video extension
        const videos = files.filter(file => SETTINGS_DATA_SCHEMA[frmtStr]['enum'].includes(path.extname(file).toLowerCase().replace('.', '')));

        // get the data and thumbnail for each video
        const videosData = await Promise.all(videos.map(video => getVideoData(video, isCaps)));

        // iterate through each video data (backwards, since we may splice the array)
        for (let i = videosData.length - 1; i > -1; i--) {
            // if the video is not corrupted, update the video count and size
            if (videosData[i] !== null) {
                videoCount++;
                size += videosData[i]['data']['size'];
            }
            // else, update the corrupted count and remove the corrupted video
            else {
                corrCount++;
                videosData.splice(i, 1);
            }
        }

        // return all the counts and data on the videos
        return [ videosData, videoCount, corrCount, videoCount + corrCount, size ];
    });

    // gets the settings object
    ipcMain.handle('stgs:getAllStgsData', (_) => data['stgs'].store);
    
    // gets the list of devices
    ipcMain.handle('stgs:getAllDevsData', (_) => data['devs']);

    // gets the list of displays
    ipcMain.handle('stgs:getAllDispsData', (_) => data['disps']);

    // sets the value of a specific setting
    ipcMain.handle('stgs:setStg', async (_, key, value) => {
        // variables for the dialog
        let result;

        // log basic information about the setting
        logProc('Settings', 'SET', 'Setting a setting', false);  // boolean1 isFinalMsg
        logProc('Settings', 'SET', `Key: ${key}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        logProc('Settings', 'SET', `Value: ${JSON.stringify(value)}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        logProc('Settings', 'SET', `Type: ${typeof(value)}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // validate the setting type and value
        value = validStg(key, value);

        logProc('Settings', 'SET', `Validated value: ${JSON.stringify(value)}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        logProc('Settings', 'SET', `Validated type: ${typeof(value)}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // certain settings require unique behavior
        switch (key) {
            case 'capturesDirectory':
                // open the directory
                result = await atmpAsyncFunc(() => dialog.showOpenDialog({ 'defaultPath': data['stgs'].get('capturesDirectory'), 'properties': ['openDirectory'] }));
        
                // check if the operation was not canceled and there is a new value
                if (!result.canceled && result.filePaths[0] !== data['stgs'].get('capturesDirectory')) {
                    // grab the new value
                    value = result.filePaths[0];

                    // delete the old thumbnail directory and its content
                    await atmpAsyncFunc(() => fs.rm(CAPTURES_THUMBNAIL_DIRECTORY, { 'recursive': true, 'force': true }));
            
                    // recreate the thumbnail directory
                    await atmpAsyncFunc(() => fs.mkdir(CAPTURES_THUMBNAIL_DIRECTORY));

                    // should realistically never fail, but checks if the new directory exists
                    if (await atmpAsyncFunc(() => fs.access(value))) {
                        // reverts to the default setting if needed
                        value = SETTINGS_DATA_DEFS[key];
                    }

                    // sets the new captures directory
                    await atmpAsyncFunc(() => webSocketReq('SetProfileParameter', { 'parameterCategory': 'AdvOut', 'parameterName': 'RecFilePath', 'parameterValue': value }));

                    // close the old captures directory watcher and create the new one to watch for any file updates
                    await states['capsWatch'].close();
                    states['capsWatch'] = chokidar.watch(value, { 'ignored': (filePath, stats) => stats?.isFile() && !SETTINGS_DATA_SCHEMA['capturesFormat']['enum'].includes(path.extname(filePath).toLowerCase().replace('.', '')), 'ignoreInitial': true, 'awaitWriteFinish': true, 'depth': 0});
                    loadWatchL(true);  // boolean1 isCaps
                }
                else {
                    return null;
                }

                break;
            
            case 'capturesFormat':
                // sets the new captures format
                await atmpAsyncFunc(() => webSocketReq('SetProfileParameter', { 'parameterCategory': 'AdvOut', 'parameterName': 'RecFormat2', 'parameterValue': value }));

                break;

            case 'capturesEncoder':
                // sets the new captures encoder
                await atmpAsyncFunc(() => webSocketReq('SetProfileParameter', { 'parameterCategory': 'AdvOut', 'parameterName': 'RecEncoder', 'parameterValue': value }));

                // changes the bitrate by file manipulation (no websocket implementation for this yet)
                await atmpAsyncFunc(() => fs.writeFile(RECORD_ENCODER_PATH, JSON.stringify(value == 'obs_x264' ? { 'bitrate': data['stgs'].get('capturesBitrate') } : { 'rate_control': 'CBR', 'bitrate': data['stgs'].get('capturesBitrate') }), { }));

                break;

            case 'capturesWidth':
                // sets the new captures width
                await atmpAsyncFunc(() => webSocketReq('SetProfileParameter', { 'parameterCategory': 'Video', 'parameterName': 'BaseCX', 'parameterValue': `${value}` }));
                await atmpAsyncFunc(() => webSocketReq('SetProfileParameter', { 'parameterCategory': 'Video', 'parameterName': 'OutputCX', 'parameterValue': `${value}` }));

                break;

            case 'capturesHeight':
                // sets the new captures height
                await atmpAsyncFunc(() => webSocketReq('SetProfileParameter', { 'parameterCategory': 'Video', 'parameterName': 'BaseCY', 'parameterValue': `${value}` }));
                await atmpAsyncFunc(() => webSocketReq('SetProfileParameter', { 'parameterCategory': 'Video', 'parameterName': 'OutputCY', 'parameterValue': `${value}` }));

                break;

            case 'capturesDisplay':
                // set the new captures display
                await atmpAsyncFunc(() => webSocketReq('SetInputSettings', { 'inputName': 'Display Input', 'inputUuid': uuids['dispInput'], 'inputSettings': { 'method': 2, 'monitor_id': '\\\\?\\' + data['disps'][value]['id'] }, 'overlay': true }));

                break;

            case 'capturesFramerate':
                // set the new captures framerate
                await atmpAsyncFunc(() => webSocketReq('SetProfileParameter', { 'parameterCategory': 'Video', 'parameterName': 'FPSInt', 'parameterValue': `${value}` }));

                break;

            case 'capturesBitrate':
                // set the new captures bitrate
                await atmpAsyncFunc(() => fs.writeFile(path.join(RECORD_ENCODER_PATH), JSON.stringify(data['stgs'].get('capturesEncoder') === 'obs_x264' ? { 'bitrate': value } : { 'rate_control': 'CBR', 'bitrate': value }), { }));

                break;
            
            case 'autoRecord':
                // set the auto record and toggle it
                data['stgs'].set(key, value);

                togAutoRec();
                
                break;

            case 'programs':
                // open the program path
                result = await atmpAsyncFunc(() => dialog.showOpenDialog({ 'properties': ['openFile'], 'filters': [{ 'name': "Executable", 'extensions': ['exe', 'app'] }] }));
            
                // check if the operation was not cancelled
                if (!result.canceled) {
                    // get the program name without the extension and create the program object
                    const name = path.parse(result.filePaths[0]).name;
                    const prog = { [name]: { 'extName': path.basename(result.filePaths[0]), 'iconPath': `data:image/png;base64,${extract(result.filePaths[0], 32).toString('base64')}` } };

                    // if the program is not already in the list of programs
                    if (!(name in data['stgs'].get('programs'))) {
                        // replace the program list with the updated list
                        data['stgs'].set(key, { ...data['stgs'].get('programs'), ...prog });

                        // return the program by itself
                        return prog;
                    }
                }

                // return null if the operation was cancelled or if the program is already in the list
                return null;

            case 'clipsDirectory':
                // open the directory
                result = await dialog.showOpenDialog({ 'defaultPath': data['stgs'].get('clipsDirectory'), 'properties': ['openDirectory'] });
        
                // check if the operation was not cancled and there is a new value
                if (!result.canceled && result.filePaths[0] !== value) {
                    // grab the new value
                    value = result.filePaths[0];
    
                    // delete the old thumbnail directory and its content
                    await atmpAsyncFunc(() => fs.rm(CLIPS_THUMBNAIL_DIRECTORY, { 'recursive': true, 'force': true }));
            
                    // recreate the thumbnail directory
                    await atmpAsyncFunc(() => fs.mkdir(CLIPS_THUMBNAIL_DIRECTORY));

                    // should realistically never fail, but checks if the new directory exists
                    if (await atmpAsyncFunc(() => fs.access(value))) {
                        // reverts to the default setting if needed
                        value = SETTINGS_DATA_DEFS[key];
                    }

                    // close the old clips directory watcher and create the new one to watch for any file updates
                    await states['clipsWatch'].close();
                    states['clipsWatch'] = chokidar.watch(value, { 'ignored': (filePath, stats) => stats?.isFile() && !SETTINGS_DATA_SCHEMA['clipsFormat']['enum'].includes(path.extname(filePath).toLowerCase().replace('.', '')), 'ignoreInitial': true, 'awaitWriteFinish': true, 'depth': 0});
                    loadWatchL(false);  // boolean1 isCaps
                }
                else {
                    return null;
                }

                break;

            case 'speaker':
                // set the new speaker, or set to default
                if (value !== 'Default') {
                    await atmpAsyncFunc(() => webSocketReq('SetInputSettings', { 'inputName': 'Speaker Input', 'inputUuid': uuids['spkInp'], 'inputSettings': { 'device_id': data['devs']['outs'][value] }, 'overlay': true }));
                }
                else {
                    await atmpAsyncFunc(() => webSocketReq('SetInputSettings', { 'inputName': 'Speaker Input', 'inputUuid': uuids['spkInp'], 'inputSettings': { }, 'overlay': false }));
                }

                break;

            case 'speakerVolume':
                // set the new speaker volume
                await atmpAsyncFunc(() => webSocketReq('SetInputVolume', { 'inputName': 'Speaker Input', 'inputUuid': uuids['spkInp'], 'inputVolumeDb': value * 100 - 100 }));

                break;

            case 'microphone':
                // set the new microphone, or set to default
                if (data['stgs'].get('microphone') !== 'Default') {
                    await atmpAsyncFunc(() => webSocketReq('SetInputSettings', { 'inputName': 'Microphone Input', 'inputUuid': uuids['micInp'], 'inputSettings': { 'device_id': data['devs']['inps'][value] }, 'overlay': true }));
                }
                else {
                    await atmpAsyncFunc(() => webSocketReq('SetInputSettings', { 'inputName': 'Microphone Input', 'inputUuid': uuids['micInp'], 'inputSettings': { }, 'overlay': false }));
                }

                break;

            case 'microphoneVolume':
                // set the new microphone volume
                await atmpAsyncFunc(() => webSocketReq('SetInputVolume', { 'inputName': 'Microphone Input', 'inputUuid': uuids['micInp'], 'inputVolumeDb': value * 100 - 100 }));

                break;
        }
    
        // save the setting
        data['stgs'].set(key, value);

        // return the value to renderer process to show in the setting field
        return value;
    });
}

/**
 * Gets the meta data of the video
 * 
 * @param {string} video - The video to get the meta data of
 * @param {string} dir - The directory of the video
 * @param {boolean} isCaps - If the call is for captures or clips
 * @returns {Object} The list of video meta data
 */
async function getVideoData(video, isCaps) {
    // get the captures or clips variable
    const dir = data['stgs'].get(isCaps ? 'capturesDirectory' : 'clipsDirectory');
    // turn ffprobe into a promise based function and get basic video data
    const ffprobeProm = promisify(ffmpeg.ffprobe);
    const videoName = path.parse(video).name;
    const splitName = video.split('-CC');
    const videoPath = path.join(dir, video);
    const videoMetaData = await atmpAsyncFunc(() => fs.stat(videoPath));
    const tbnlDir = isCaps ? CAPTURES_THUMBNAIL_DIRECTORY : CLIPS_THUMBNAIL_DIRECTORY;
    const tbnlPath = path.join(tbnlDir, `${videoName}.png`);
    const videoMetaData2 = await atmpAsyncFunc(() => ffprobeProm(videoPath), 1, 2000);

    // check if the file is not corrupted and can be read
    if (videoMetaData2) {
        // check if the thumbnail for this video already exists
        if (!(await atmpAsyncFunc(() => fs.access(tbnlPath)))) {
            // create the thumbnail
            await atmpAsyncFunc(() => new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .screenshots({
                        'timestamps': ['50%'],
                        'filename': videoName,
                        'folder': tbnlDir,
                        'size': THUMBNAIL_SIZE
                    });
            }));
        }

        // return the data on the video
        return {
            'data': { 
                'date': videoMetaData.birthtime, 
                'dur': videoMetaData2.format.duration, 
                'game': splitName[1] ? splitName[0] : 'External', 
                'extName': video, 
                'fps': videoMetaData2.streams.find(stream => stream.codec_type === 'video').r_frame_rate.split('/').map(Number).reduce((a, b) => a / b), 
                'path': videoPath, 
                'size': videoMetaData.size, 
                'tbnlPath': tbnlPath 
            }, 
            'node': null, 
            'intvId': null 
        };
    }
    // return null
    else {
        return null;
    }
}

/**
 * Loads the directory watcher listeners
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function loadWatchL(isCaps) {
    // get the captures or clips variable
    const watchStr = isCaps ? 'capsWatch' : 'clipsWatch';

    // on add, log that a video has been added and request the renderer to add the new video
    states[watchStr].on('add', async (filePath) => {
        logProc('Settings', 'ADD', 'New file added to the directory', false);  // boolean1 isFinalMsg
        logProc('Settings', 'ADD', `isCaps: ${isCaps}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        logProc('Settings', 'ADD', `filePath: ${filePath}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // add the new video to the gallery
        insts['mainWindow']['webContents'].send('stgs:reqAddVideo', await getVideoData(path.basename(filePath), isCaps), isCaps);
    });

    // on unlink, log that a video has been deleted and request the renderer to remove the video
    states[watchStr].on('unlink', async (filePath) => {
        // get the captures or clips variable
        const tbnlDir = isCaps ? CAPTURES_THUMBNAIL_DIRECTORY : CLIPS_THUMBNAIL_DIRECTORY;

        logProc('Settings', 'DEL', 'File deleted from the directory', false);  // boolean1 isFinalMsg
        logProc('Settings', 'DEL', `isCaps: ${isCaps}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        logProc('Settings', 'DEL', `filePath: ${filePath}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // remove the video from the gallery and delete the thumbnail image
        insts['mainWindow']['webContents'].send('stgs:reqDelVideo', path.basename(filePath), isCaps);
        atmpAsyncFunc(() => fs.unlink(path.join(tbnlDir, `${path.parse(filePath).name}.png`)));
    });
}

/**
 * Validates the settings type and value, if enumerated or bound
 * 
 * @param {string} key - The key (name) of the setting
 * @param {boolean | number | string} value - The value of the setting
 * @returns {boolean | number | string} The validated value of the setting
 */
function validStg(key, value) {
    // check what type this setting SHOULD have
    switch(SETTINGS_DATA_SCHEMA[key]['type']) {
        case 'boolean':
            // if the type is not boolean, revert to the default value
            if (typeof(value) !== 'boolean') {
                value = SETTINGS_DATA_DEFS[key];
            }

            break;

        case 'number':
            // if the value is not a number, revert to the default value
            if (isNaN(value)) {
                value = SETTINGS_DATA_DEFS[key];
            }
            else {
                // if the key has an enumeration, ensure the value is in it, or revert to the default value
                if (SETTINGS_DATA_SCHEMA[key]['enum']) {
                    value = !SETTINGS_DATA_SCHEMA[key]['enum'].includes(Number(value)) ? SETTINGS_DATA_DEFS[key] : Number(value);
                }
                else {
                    // set it to the closest bound, or keep the value
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
            
            break;

        case 'object':
            // if the type is not object, revert to the default value
            if (typeof(value) !== 'object') {
                value = SETTINGS_DATA_DEFS[key];
            }

            break;

        case 'string':
            // if the type is not string or the value is not un the enumeration, revert to the default value
            if (typeof(value) !== 'string' || (SETTINGS_DATA_SCHEMA[key]['enum'] && !SETTINGS_DATA_SCHEMA[key]['enum'].includes(value))) {
                value = SETTINGS_DATA_DEFS[key];
            }
        
            break;
    }    

    return value;
}

/**
 * Gets the list of input and output devices
 * 
 * @returns {Object} The list of inputs and outputs, each with the name and ID of the device
 */
async function getDevs() {
    // turn exec into a promise based function and get the list of devices
    const execProm = promisify(exec);
    const { stdout } = await atmpAsyncFunc(() => execProm(SHELL_DEVICES_COMMAND, { shell: 'powershell.exe' }));
    const inps = {}, outs = {};

    JSON.parse(stdout).forEach(dev => {
        if (/microphone|line in/i.test(dev.Name)) {
            inps[dev.Name] = dev.DeviceID.replace(/^SWD\\MMDEVAPI\\/, '').trim().toLowerCase();
        }
        else {
            outs[dev.Name] = dev.DeviceID.replace(/^SWD\\MMDEVAPI\\/, '').trim().toLowerCase();
        }
    });

    return { 'inps': inps, 'outs': outs };
}

/**
 * Gets the list of displays
 * 
 * @returns {Object} The list of displays including position, size, and id
 */
async function getDisps() {
    try {
        return JSON.parse(await atmpAsyncFunc(() => fs.readFile(path.join(ACTIVE_DIRECTORY, 'runtime-displays.json'))));
    } 
    catch (error) {
        logProc('Settings', 'ERROR', 'Cannot get list of displays', false);  // boolean1 isFinalMsg
        logProc('Settings', 'ERROR', `Error message: ${error}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    }
}

/**
 * Toggles the auto recording
 */
function togAutoRec() {
    // if auto recording is on, start checking the programs list periodically; else, cancel the auto recording
    data['stgs'].get('autoRecord') ? states['autoRecIntv'] = setInterval(checkProgs, CHECK_PROGRAMS_DELAY) : clearInterval(states['autoRecIntv']);
}

/**
 * Checks if certain programs are running and toggle auto recording
 */
async function checkProgs() {
    // get the process list and programs list
    const procs = await atmpAsyncFunc(() => psList());
    const progs = data['stgs'].get('programs');

    // check if recording is enabled
    if (flags['isRec']) {
        // check if the recording game is not running or the program is not in the list, and stop the recording
        if (!progs[states['recGame']] || (states['recGame'] && !procs.some(proc => proc.name === progs[states['recGame']]['extName']))) {
            insts['mainWindow']['webContents'].send('stgs:reqTogRecBarBtn');
        }
    }
    // else, check the program list and enable recording if a match is found
    else {
        for (const [name, progInfo] of Object.entries(progs)) {
            if (procs.some(proc => proc.name === progInfo['extName'])) {
                states['recGame'] = name;

                insts['mainWindow']['webContents'].send('stgs:reqTogRecBarBtn', states['recGame']);

                break;
            }
        }
    }
}