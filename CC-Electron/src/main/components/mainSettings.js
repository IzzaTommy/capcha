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
 * @requires mainGeneral
 * @requires mainWebSocket
 */
import { exec } from 'child_process';
import chokidar from 'chokidar';
import { app, dialog, ipcMain, shell } from 'electron';
import Store from 'electron-store';
import extract from 'extract-file-icon';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import psList from 'ps-list';
import { promisify } from 'util'
import { addLog, sendIPC, atmpAsyncFunc } from './mainGeneral.js';
import { getIsRec, sendWebSocketReq, sendWebSocketBatchReq } from './mainWebSocket.js';

// settings constants
// active directory, default video and thumbnail directories, thumbnail size
const ACTIVE_DIRECTORY = import.meta.dirname;
const CAPTURES_DIRECTORY_DEF = path.join(app.getPath('videos'), 'CapCha', 'Captures');
const CLIPS_DIRECTORY_DEF = path.join(app.getPath('videos'), 'CapCha', 'Clips');
const CAPTURES_THUMBNAIL_DIRECTORY = path.join(app.getPath('userData'), 'Thumbnails', 'Captures');
const CLIPS_THUMBNAIL_DIRECTORY = path.join(app.getPath('userData'), 'Thumbnails', 'Clips');
const THUMBNAIL_SIZE = '320x180';

// shell devices command, settings config file path, schema, and defaults, encoder and runtime displays path
const SHELL_DEVICES_COMMAND = `Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'AudioEndpoint' } | Select-Object Name, DeviceID | ConvertTo-Json -Compress`;
const SETTINGS_CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
const SETTINGS_DATA_SCHEMA = { 
    'navigationBarActive': {
        'type': 'boolean'
    },

    'capturesProgramFilter': {
        'type': 'string'
    },
    'capturesMetaFilter': {
        'type': 'string',
        'enum': ['Name', 'Date', 'Size', 'Duration']
    },
    'capturesAscending': {
        'type': 'boolean'
    },

    'clipsProgramFilter': {
        'type': 'string'
    },
    'clipsMetaFilter': {
        'type': 'string',
        'enum': ['Name', 'Date', 'Size', 'Duration']
    },
    'clipsAscending': {
        'type': 'boolean'
    }, 

    'videoVolume': {
        'type': 'number',
        'minimum': 0,
        'maximum': 1,
    },
    'videoVolumeMuted': {
        'type': 'boolean'
    },

    'darkMode': {
        'type': 'boolean'
    },

    'capturesDirectory': {
        'type': 'string'
    },
    'capturesLimit': {
        'type': 'number',
        'enum': [0, 5, 10, 20, 50, 100, 200, 500]
    },
    'capturesFormat': {
        'type': 'string',
        'enum': ['mp4', 'mkv']
    },
    'capturesEncoder': {
        'type': 'string',
        'enum': ['obs_nvenc_h264_tex', 'obs_nvenc_hevc_tex', 'obs_x264']
    },
    'capturesWidth': {
        'type': 'number',
        'minimum': 1,
        'maximum': 4096
    },
    'capturesHeight': {
        'type': 'number',
        'minimum': 1,
        'maximum': 4096
    },
    'capturesDisplay': {
        'type': 'string'
    },
    'capturesFramerate': {
        'type': 'number',
        'enum': [10, 20, 24, 30, 48, 60]
    },
    'capturesBitrate': {
        'type': 'number',
        'enum': [3000, 5000, 10000, 15000, 20000, 30000, 50000, 100000]
    },
    'autoRecord': {
        'type': 'boolean'
    }, 
    'programs': {
        'type': 'object', 
        'properties': { 
            'fullName': { 'type': 'string' }, 
            'dataURL': { 'type': 'string' }
        }
    }, 

    'clipsDirectory': {
        'type': 'string'
    },
    'clipsLimit': {
        'type': 'number',
        'enum': [0, 5, 10, 20, 50, 100, 200, 500]
    },
    'clipsFormat': {
        'type': 'string',
        'enum': ['mp4', 'mkv']
    },
    'clipsWidth': {
        'type': 'number',
        'minimum': 1,
        'maximum': 4096
    },
    'clipsHeight': {
        'type': 'number',
        'minimum': 1,
        'maximum': 4096
    },

    'speaker': {
        'type': 'string'
    },
    'speakerVolume': {
        'type': 'number',
        'minimum': 0,
        'maximum': 1,
    },
    'microphone': {
        'type': 'string'
    },
    'microphoneVolume': {
        'type': 'number',
        'minimum': 0,
        'maximum': 1,
    },
    'webcam': {
        'type': 'string'
    }
};
const SETTINGS_DATA_DEFS = { 
    'navigationBarActive': true,
    
    'capturesProgramFilter': 'All',
    'capturesMetaFilter': 'Date',
    'capturesAscending': false,

    'clipsProgramFilter': 'All',
    'clipsMetaFilter': 'Date',
    'clipsAscending': false,

    'videoVolume': 0.1,
    'videoVolumeMuted': true,

    'darkMode': true,

    'capturesDirectory': CAPTURES_DIRECTORY_DEF,
    'capturesLimit': 50, 
    'capturesFormat': 'mp4', 
    'capturesEncoder': 'obs_nvenc_h264_tex', 
    'capturesWidth': 1280, 
    'capturesHeight': 720, 
    'capturesDisplay': '', 
    'capturesFramerate': 30,
    'capturesBitrate': 3000,
    'autoRecord': false,
    'programs': { }, 

    'clipsDirectory': CLIPS_DIRECTORY_DEF,
    'clipsLimit': 50, 
    'clipsFormat': 'mp4', 
    'clipsWidth': 1280, 
    'clipsHeight': 720, 

    'speaker': 'Default',
    'speakerVolume': 0.5, 
    'microphone': 'Default', 
    'microphoneVolume': 0.5
    // webcam: ''
};
const RECORDING_ENCODER_PATH = path.join(ACTIVE_DIRECTORY, '..', '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json');
const RUNTIME_DISPLAYS_PATH = path.join(ACTIVE_DIRECTORY, '..', 'runtime-displays.json');

// watcher stability threshold and poll interval
const WATCHER_STABILITY_THRESHOLD = 2000;
const WATCHER_POLL_INTERVAL = 100;

// default profile, scene, speaker, microphone, and display input names, check programs delay
const PROFILE_NAME = 'CapCha';
const SCENE_NAME = 'CapCha';
const SPEAKER_INPUT_NAME = 'Speaker Input';
const MICROPHONE_INPUT_NAME = 'Microphone Input';
const DISPLAY_INPUT_NAME = 'Display Input';
const CHECK_PROGRAMS_DELAY = 5000;

// byte sizing
const BYTES_IN_GIGABYTE = 1073741824;

// settings variable
let recProgName;

// settings states
let capsWatch, clipsWatch, checkProgsIntvId;

// settings uuids
let sceneUuid, spkInpUuid, micInpUuid, dispInpUuid, scenes, inps;

// settings, devices, displays, captures, and clips
let stgs, devs, disps, caps, clips, capsCounts, clipsCounts;

/**
 * Initializes the settings variables
 */
export function initMainStgsVars() {
    // recording program
    recProgName = null;

    // captures and clips watcher, check programs interval id
    capsWatch = null;
    clipsWatch = null;
    checkProgsIntvId = null;

    // scene, speaker, microphone, and display input uuids, scenes, and inputs lists
    sceneUuid = null;
    spkInpUuid = null;
    micInpUuid = null;
    dispInpUuid = null;
    scenes = null;
    inps = null;

    // settings, displays, devices, caps, clips videos and counts
    stgs = null;
    disps = null;
    devs = null;
    caps = null;
    clips = null;
    capsCounts = {
        'normal': null, 
        'size': null
    };
    clipsCounts = {
        'normal': null, 
        'size': null
    };
}

/**
 * Initializes the settings for electron-store and OBS
 */
export async function initMainStgs() {
    // initialize the settings
    await atmpAsyncFunc(() => initStgs());

    // initialize the settings listeners
    initStgsL();
}

/**
 * Initializes the settings
 */
async function initStgs() {
    // get the devices and displays
    [devs, disps] = await Promise.all([getDevs(), getDisps()]);

    // try to load the settings for electron-store
    try {
        stgs = new Store({ 'defaults': SETTINGS_DATA_DEFS, 'schema': SETTINGS_DATA_SCHEMA });
    }
    // error will occur if the file cannot be read, has corrupted values, or has invalid values (which should only occur if the user manually tampered with it)
    catch (error) {
        // log that the settings could not be read
        addLog('Settings', 'ERROR', 'Configuration file cannot be read', false);  // boolean1 isFinalMsg
        addLog('Settings', 'ERROR', `Error message: ${error}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // try to delete the corrupted file and reinitialize the settings
        try {
            // delete the corrupted file
            atmpAsyncFunc(() => fs.unlink(SETTINGS_CONFIG_PATH));

            // log that the configuration file was deleted
            addLog('Settings', 'ERROR', 'Deleting the corrupt configuration file', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

            // reinitialize the settings with the default values
            stgs = new Store({ 'defaults': SETTINGS_DATA_DEFS, 'schema': SETTINGS_DATA_SCHEMA });

            // log that the settings were reinitialized
            addLog('Settings', 'ERROR', 'Reinitializing settings with default values', true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        } 
        catch (error) {
            // log that the configuration file could not be deleted
            addLog('Settings', 'ERROR', 'Could not delete the corrupt configuration file', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            addLog('Settings', 'ERROR', `Error message: ${error}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        }
    }

    // create the captures and clips directory watchers to watch for any file changes
    capsWatch = chokidar.watch(stgs.get('capturesDirectory'), { 'ignored': (capPath, capStats) => capStats?.isFile() && !SETTINGS_DATA_SCHEMA['capturesFormat']['enum'].includes(path.extname(capPath).toLowerCase().replace('.', '')), 'ignoreInitial': true, 'awaitWriteFinish': { stabilityThreshold: WATCHER_STABILITY_THRESHOLD, pollInterval: WATCHER_POLL_INTERVAL }, 'depth': 0 });
    clipsWatch = chokidar.watch(stgs.get('clipsDirectory'), { 'ignored': (clipPath, clipStats) => clipStats?.isFile() && !SETTINGS_DATA_SCHEMA['clipsFormat']['enum'].includes(path.extname(clipPath).toLowerCase().replace('.', '')), 'ignoreInitial': true, 'awaitWriteFinish': { stabilityThreshold: WATCHER_STABILITY_THRESHOLD, pollInterval: WATCHER_POLL_INTERVAL }, 'depth': 0 });

    // load the captures and clips watcher listeners
    setWatchL(true);  // boolean1 isCaps
    setWatchL(false);  // boolean1 isCaps

    // check if the CapCha profile does not exist
    if (!(await atmpAsyncFunc(() => sendWebSocketReq('GetProfileList')))['responseData']['profiles'].includes(PROFILE_NAME)) {
        // create the CapCha profile
        await atmpAsyncFunc(() => sendWebSocketReq('CreateProfile', { 'profileName': PROFILE_NAME }));
    }
    
    // send WebSocket a batch request
    await atmpAsyncFunc(() => sendWebSocketBatchReq(false, 0, [
        // set the profile to the CapCha profile
        {
            'requestType': 'SetCurrentProfile', 
            'requestData': { 'profileName': PROFILE_NAME } 
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
            'requestData': { 'parameterCategory': 'AdvOut', 'parameterName': 'RecFilePath', 'parameterValue': stgs.get('capturesDirectory') } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'AdvOut', 'parameterName': 'RecFormat2', 'parameterValue': stgs.get('capturesFormat') } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'AdvOut', 'parameterName': 'RecEncoder', 'parameterValue': stgs.get('capturesEncoder') } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'BaseCX', 'parameterValue': `${stgs.get('capturesWidth')}` } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'OutputCX', 'parameterValue': `${stgs.get('capturesWidth')}` } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'BaseCY', 'parameterValue': `${stgs.get('capturesHeight')}` } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'OutputCY', 'parameterValue': `${stgs.get('capturesHeight')}` } 
        }, 
        {
            'requestType': 'SetProfileParameter', 
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'FPSInt', 'parameterValue': `${stgs.get('capturesFramerate')}` } 
        }, 
    ]));

    // try to set the bitrate by manipulating the file with bitrate information
    try {
        await atmpAsyncFunc(() => fs.writeFile(RECORDING_ENCODER_PATH, JSON.stringify(stgs.get('capturesEncoder') == 'obs_x264' ? { 'bitrate': stgs.get('capturesBitrate') } : { 'rate_control': 'CBR', 'bitrate': stgs.get('capturesBitrate') })));
    } 
    catch (error) {
        // log that the bitrate could not be set
        addLog('Settings', 'ERROR', 'Could not set the bitrate', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLog('Settings', 'ERROR', `Error message: ${error}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    }

    // get the list of scenes and inputs
    scenes = (await atmpAsyncFunc(() => sendWebSocketReq('GetSceneList')))['responseData']['scenes'];
    inps = (await atmpAsyncFunc(() => sendWebSocketReq('GetInputList', { })))['responseData']['inputs'];

    // create the CapCha scene if it doesn't exist
    sceneUuid = scenes.some(scene => scene['sceneName'] === SCENE_NAME) ? scenes[scenes.findIndex(scene => scene['sceneName'] === SCENE_NAME)]['sceneUuid'] : (await atmpAsyncFunc(() => sendWebSocketReq('CreateScene', { 'sceneName': SCENE_NAME })))['responseData']['sceneUuid'];

    // set the scene to the CapCha scene
    await atmpAsyncFunc(async () => sendWebSocketReq('SetCurrentProgramScene', { 'sceneName': SCENE_NAME, 'sceneUuid': sceneUuid }));
    
    // mute the desktop audio (they appear by default and will be redundant)
    if (inps.some(input => input['inputName'] === 'Desktop Audio')) {
        await atmpAsyncFunc(async () => sendWebSocketReq('SetInputMute', { 'inputName': 'Desktop Audio', 'inputUuid': inps[inps.findIndex(input => input['inputName'] === 'Desktop Audio')]['inputUuid'], 'inputMuted': true }));
    }

    // mute the mic/aux (they appear by default and will be redundant)
    if (inps.some(input => input['inputName'] === 'Mic/Aux')) {
        await atmpAsyncFunc(async () => sendWebSocketReq('SetInputMute', { 'inputName': 'Mic/Aux', 'inputUuid': inps[inps.findIndex(input => input['inputName'] === 'Mic/Aux')]['inputUuid'], 'inputMuted': true }));
    }

    // create the speaker input if it does not exist
    spkInpUuid = inps.some(input => input['inputName'] === SPEAKER_INPUT_NAME) ? inps[inps.findIndex(input => input['inputName'] === SPEAKER_INPUT_NAME)]['inputUuid'] : (await atmpAsyncFunc(async () => sendWebSocketReq('CreateInput', { 'sceneName': SCENE_NAME, 'sceneUuid': sceneUuid, 'inputName': SPEAKER_INPUT_NAME, 'inputKind': 'wasapi_output_capture', 'inputSettings': { }, 'sceneItemEnabled': true })))['responseData']['inputUuid'];

    // check if the speaker is not the default speaker and the speaker is currently available
    if (stgs.get('speaker') !== 'Default' && stgs.get('speaker') in devs['outs']) {
        // set the speaker to the device in the settings
        await atmpAsyncFunc(async () => sendWebSocketReq('SetInputSettings', { 'inputName': SPEAKER_INPUT_NAME, 'inputUuid': spkInpUuid, 'inputSettings': { 'device_id': devs['outs'][stgs.get('speaker')] }, 'overlay': true }));
    }
    // else, set the speaker to the default
    else {
        stgs.set('speaker', 'Default');
        await atmpAsyncFunc(async () => sendWebSocketReq('SetInputSettings', { 'inputName': SPEAKER_INPUT_NAME, 'inputUuid': spkInpUuid, 'inputSettings': { }, 'overlay': false }));
    }

    // set the speaker volume
    await atmpAsyncFunc(async () => sendWebSocketReq('SetInputVolume', { 'inputName': SPEAKER_INPUT_NAME, 'inputUuid': spkInpUuid, 'inputVolumeDb': stgs.get('speakerVolume') * 100 - 100 }));

    // create the microphone input if it does not exist
    micInpUuid = inps.some(input => input['inputName'] === MICROPHONE_INPUT_NAME) ? inps[inps.findIndex(input => input['inputName'] === MICROPHONE_INPUT_NAME)]['inputUuid'] : (await atmpAsyncFunc(async () => sendWebSocketReq('CreateInput', { 'sceneName': SCENE_NAME, 'sceneUuid': sceneUuid, 'inputName': MICROPHONE_INPUT_NAME, 'inputKind': 'wasapi_input_capture', 'inputSettings': { }, 'sceneItemEnabled': true })))['responseData']['inputUuid'];
    
    // check if the microphone is not the default microphone and the microphone is currently available
    if (stgs.get('microphone') !== 'Default' && stgs.get('microphone') in devs['inps']) {
        // set the microphone to the device in the settings
        await atmpAsyncFunc(async () => sendWebSocketReq('SetInputSettings', { 'inputName': MICROPHONE_INPUT_NAME, 'inputUuid': micInpUuid, 'inputSettings': { 'device_id': devs['inps'][stgs.get('microphone')] }, 'overlay': true }));
    }
    // else, set the microphone to the default
    else {
        stgs.set('microphone', 'Default');
        await atmpAsyncFunc(async () => sendWebSocketReq('SetInputSettings', { 'inputName': MICROPHONE_INPUT_NAME, 'inputUuid': micInpUuid, 'inputSettings': { }, 'overlay': false }));
    }

    // set the microphone volume
    await atmpAsyncFunc(async () => sendWebSocketReq('SetInputVolume', { 'inputName': MICROPHONE_INPUT_NAME, 'inputUuid': micInpUuid, 'inputVolumeDb': stgs.get('microphoneVolume') * 100 - 100 }));

    // create the display input if it does not exist
    dispInpUuid = inps.some(input => input['inputName'] === DISPLAY_INPUT_NAME) ? inps[inps.findIndex(input => input['inputName'] === DISPLAY_INPUT_NAME)]['inputUuid'] : (await atmpAsyncFunc(async () => sendWebSocketReq('CreateInput', { 'sceneName': SCENE_NAME, 'sceneUuid': sceneUuid, 'inputName': DISPLAY_INPUT_NAME, 'inputKind': 'monitor_capture', 'inputSettings': { }, 'sceneItemEnabled': true })))['responseData']['inputUuid'];

    // set the display to the device in the settings
    if (stgs.get('capturesDisplay') in disps) {
        await atmpAsyncFunc(async () => sendWebSocketReq('SetInputSettings', { 'inputName': DISPLAY_INPUT_NAME, 'inputUuid': dispInpUuid, 'inputSettings': { 'method': 2, 'monitor_id': '\\\\?\\' + disps[stgs.get('capturesDisplay')]['id'] }, 'overlay': true }));
    }
    else {
        // if the list of displays is empty, set the display to nothing
        if (Object.keys(disps).length === 0) {
            stgs.set('capturesDisplay', '');
        }
        // else, set the display to the first one in the list
        else {
            stgs.set('capturesDisplay', Object.keys(disps)[0]);
            await atmpAsyncFunc(async () => sendWebSocketReq('SetInputSettings', { 'inputName': DISPLAY_INPUT_NAME, 'inputUuid': dispInpUuid, 'inputSettings': { 'method': 2, 'monitor_id': '\\\\?\\' + disps[stgs.get('capturesDisplay')]['id'] }, 'overlay': true }));
        }
    }
}

/**
 * Initializes the settings listeners
 */
function initStgsL() {
    // on reqSetAutoRecState, call setAutoRecState
    ipcMain.on('stgs:reqSetAutoRecState', setAutoRecState); 

    // on openDir, open the captures or clips directory
    ipcMain.on('stgs:openDir', async (_, isCaps) => {
        await atmpAsyncFunc(() => shell.openPath(stgs.get(isCaps ? 'capturesDirectory' : 'clipsDirectory')));
    });

    // on delProg, delete the program from the programs list
    ipcMain.handle('stgs:delProg', (_, progName) => {
        // get the programs list
        const progs = stgs.get('programs');

        // delete the program and update the programs list
        delete progs[progName];
        stgs.set('programs', progs);

        // return if the program was removed
        return !(progName in stgs.get('programs'));
    });

    // on delVideo, delete the video from the captures or clips
    ipcMain.on('stgs:delVideo', async (_, videoPath) => {
        // deletes the video
        await atmpAsyncFunc(() => fs.unlink(videoPath), 1);
    });

    // on getAllDirData, get the videos and counts for the captures or clips directory
    ipcMain.handle('stgs:getAllDirData', async (_, isCaps) => {
        // get the captures or clips variables
        const videosFrmtStr = isCaps ? 'capturesFormat' : 'clipsFormat';
        const videosDir = stgs.get(isCaps ? 'capturesDirectory' : 'clipsDirectory');
        const videosTbnlDir = isCaps ? CAPTURES_THUMBNAIL_DIRECTORY : CLIPS_THUMBNAIL_DIRECTORY;
        const videosCounts = isCaps ? capsCounts : clipsCounts;

        // reset the videos counts
        videosCounts['normal'] = 0, videosCounts['size'] = 0;

        // ensures the thumbnail directory exists
        if (await atmpAsyncFunc(() => fs.access(videosTbnlDir))) {
            await atmpAsyncFunc(() => fs.mkdir(videosTbnlDir, { recursive: true }));  // don't need to check exist technically since recursive means no error on exist
        }
        
        // ensures the videos directory exists
        if (await atmpAsyncFunc(() => fs.access(videosDir))) {
            await atmpAsyncFunc(() => fs.mkdir(videosDir, { recursive: true }));  // don't need to check exist technically since recursive means no error on exist
        }

        // read the directory for files
        const filesFullNames = await atmpAsyncFunc(() => fs.readdir(videosDir));

        // filter the files for videos names
        const videosFullNames = filesFullNames.filter(fileFullName => SETTINGS_DATA_SCHEMA[videosFrmtStr]['enum'].includes(path.extname(fileFullName).toLowerCase().replace('.', '')));

        // get the videos (data) and create the thumbnail for each video
        isCaps ? caps = await Promise.all(videosFullNames.map(videoFullName => getVideo(videoFullName, isCaps)))
        : clips = await Promise.all(videosFullNames.map(videoFullName => getVideo(videoFullName, isCaps)));

        // get the captures or clips variable
        const videos = isCaps ? caps : clips;

        // iterate through each video (backwards, since we may splice the array)
        for (let i = videos.length - 1; i > -1; i--) {
            // if the video is not corrupted, update the normal count and size
            if (videos[i] !== null) {
                videosCounts['normal']++;
                videosCounts['size'] += videos[i]['data']['size'];
            }
            else {
                // remove the corrupted video
                videos.splice(i, 1);
            }
        }

        // check if the storage limit has been exceeded
        await checkDirSize(isCaps);

        // return the videos and counts
        return [ videos, videosCounts['normal'], videosCounts['size'] ];
    });

    // gets the settings object
    ipcMain.handle('stgs:getAllStgsData', (_) => stgs.store);
    
    // gets the list of devices
    ipcMain.handle('stgs:getAllDevsData', (_) => devs);

    // gets the list of displays
    ipcMain.handle('stgs:getAllDispsData', (_) => disps);

    // sets the value of a specific setting
    ipcMain.handle('stgs:setStg', async (_, key, value) => {
        // result of opening the dialog
        let result;

        // log basic information about the setting
        addLog('Settings', 'SET', 'Setting a setting', false);  // boolean1 isFinalMsg
        addLog('Settings', 'SET', `Key: ${key}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLog('Settings', 'SET', `Value: ${JSON.stringify(value)}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLog('Settings', 'SET', `Type: ${typeof(value)}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // validate the setting type and value
        value = validStg(key, value);

        // log the validated setting value and type
        addLog('Settings', 'SET', `Validated value: ${JSON.stringify(value)}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLog('Settings', 'SET', `Validated type: ${typeof(value)}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // certain settings require unique behavior
        switch (key) {
            case 'capturesDirectory':
                // open the directory
                result = await atmpAsyncFunc(() => dialog.showOpenDialog({ 'defaultPath': stgs.get('capturesDirectory'), 'properties': ['openDirectory'] }));
        
                // check if the operation was not canceled and there is a new value
                if (!result.canceled && result.filePaths[0] !== stgs.get('capturesDirectory')) {
                    // grab the new value
                    value = result.filePaths[0];

                    // delete the old thumbnail directory and its content
                    await atmpAsyncFunc(() => fs.rm(CAPTURES_THUMBNAIL_DIRECTORY, { 'recursive': true, 'force': true }));
            
                    // recreate the thumbnail directory
                    await atmpAsyncFunc(() => fs.mkdir(CAPTURES_THUMBNAIL_DIRECTORY));

                    // checks if the new directory exists (should not fail)
                    if (await atmpAsyncFunc(() => fs.access(value))) {
                        // reverts to the default setting
                        value = SETTINGS_DATA_DEFS[key];
                    }

                    // sets the new captures directory
                    await atmpAsyncFunc(() => sendWebSocketReq('SetProfileParameter', { 'parameterCategory': 'AdvOut', 'parameterName': 'RecFilePath', 'parameterValue': value }));

                    // close the old captures directory watcher
                    await capsWatch.close();

                    // create the captures directory watchers to watch for any file changes
                    capsWatch = chokidar.watch(value, { 'ignored': (capPath, capStats) => capStats?.isFile() && !SETTINGS_DATA_SCHEMA['capturesFormat']['enum'].includes(path.extname(capPath).toLowerCase().replace('.', '')), 'ignoreInitial': true, 'awaitWriteFinish': { stabilityThreshold: WATCHER_STABILITY_THRESHOLD, pollInterval: WATCHER_POLL_INTERVAL }, 'depth': 0});
                    
                    // set the captures watcher listeners
                    setWatchL(true);  // boolean1 isCaps
                }
                else {
                    return stgs.get('capturesDirectory');
                }

                break;
            
            case 'capturesLimit':
                // save the setting
                stgs.set(key, value);

                // check if the storage limit has been exceeded
                await checkDirSize(true);  // boolean1 isCaps

                // return the value to the renderer process to show in the setting field
                return value;

                break;

            case 'capturesFormat':
                // sets the new captures format
                await atmpAsyncFunc(() => sendWebSocketReq('SetProfileParameter', { 'parameterCategory': 'AdvOut', 'parameterName': 'RecFormat2', 'parameterValue': value }));

                break;

            case 'capturesEncoder':
                // sets the new captures encoder
                await atmpAsyncFunc(() => sendWebSocketReq('SetProfileParameter', { 'parameterCategory': 'AdvOut', 'parameterName': 'RecEncoder', 'parameterValue': value }));

                // changes the bitrate by file manipulation (no websocket implementation for this yet)
                await atmpAsyncFunc(() => fs.writeFile(RECORDING_ENCODER_PATH, JSON.stringify(value === 'obs_x264' ? { 'bitrate': stgs.get('capturesBitrate') } : { 'rate_control': 'CBR', 'bitrate': stgs.get('capturesBitrate') }), { }));

                break;

            case 'capturesWidth':
                // sets the new captures width
                await atmpAsyncFunc(() => sendWebSocketReq('SetProfileParameter', { 'parameterCategory': 'Video', 'parameterName': 'BaseCX', 'parameterValue': `${value}` }));
                await atmpAsyncFunc(() => sendWebSocketReq('SetProfileParameter', { 'parameterCategory': 'Video', 'parameterName': 'OutputCX', 'parameterValue': `${value}` }));

                break;

            case 'capturesHeight':
                // sets the new captures height
                await atmpAsyncFunc(() => sendWebSocketReq('SetProfileParameter', { 'parameterCategory': 'Video', 'parameterName': 'BaseCY', 'parameterValue': `${value}` }));
                await atmpAsyncFunc(() => sendWebSocketReq('SetProfileParameter', { 'parameterCategory': 'Video', 'parameterName': 'OutputCY', 'parameterValue': `${value}` }));

                break;

            case 'capturesDisplay':
                // set the new captures display
                await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', { 'inputName': DISPLAY_INPUT_NAME, 'inputUuid': dispInpUuid, 'inputSettings': { 'method': 2, 'monitor_id': '\\\\?\\' + disps[value]['id'] }, 'overlay': true }));

                break;

            case 'capturesFramerate':
                // set the new captures framerate
                await atmpAsyncFunc(() => sendWebSocketReq('SetProfileParameter', { 'parameterCategory': 'Video', 'parameterName': 'FPSInt', 'parameterValue': `${value}` }));

                break;

            case 'capturesBitrate':
                // set the new captures bitrate
                await atmpAsyncFunc(() => fs.writeFile(RECORDING_ENCODER_PATH, JSON.stringify(stgs.get('capturesEncoder') === 'obs_x264' ? { 'bitrate': value } : { 'rate_control': 'CBR', 'bitrate': value }), { }));

                break;
            
            case 'autoRecord':
                // set the auto record value
                stgs.set(key, value);

                // set the auto recording state
                setAutoRecState();

                // return the value to the renderer process
                return value;
                
                break;

            case 'programs':
                // open the program path
                result = await atmpAsyncFunc(() => dialog.showOpenDialog({ 'properties': ['openFile'], 'filters': [{ 'name': "Executable", 'extensions': ['exe', 'app'] }] }));
            
                // check if the operation was not cancelled
                if (!result.canceled) {
                    // get the program name
                    const progName = path.parse(result.filePaths[0])['name'];

                    // if the program is not already in the list of programs
                    if (!(progName in stgs.get('programs'))) {
                        // create the program object with the full name and icon path
                        const prog = { [progName]: { 'fullName': path.basename(result.filePaths[0]), 'dataURL': `data:image/png;base64,${extract(result.filePaths[0], 32).toString('base64')}` } };

                        // replace the program list with the updated list
                        stgs.set(key, { ...stgs.get('programs'), ...prog });

                        // return the program by itself
                        return prog;
                    }
                }

                // return null if the operation was cancelled or if the program is already in the list
                return null;

            case 'clipsDirectory':
                // open the directory
                result = await dialog.showOpenDialog({ 'defaultPath': stgs.get('clipsDirectory'), 'properties': ['openDirectory'] });
        
                // check if the operation was not cancled and there is a new value
                if (!result.canceled && result.filePaths[0] !== value) {
                    // grab the new value
                    value = result.filePaths[0];
    
                    // delete the old thumbnail directory and its content
                    await atmpAsyncFunc(() => fs.rm(CLIPS_THUMBNAIL_DIRECTORY, { 'recursive': true, 'force': true }));
            
                    // recreate the thumbnail directory
                    await atmpAsyncFunc(() => fs.mkdir(CLIPS_THUMBNAIL_DIRECTORY));

                    // checks if the new directory exists (should not fail)
                    if (await atmpAsyncFunc(() => fs.access(value))) {
                        // reverts to the default setting
                        value = SETTINGS_DATA_DEFS[key];
                    }

                    // close the old clips directory watcher
                    await clipsWatch.close();

                    // create the clips directory watchers to watch for any file changes
                    clipsWatch = chokidar.watch(value, { 'ignored': (clipPath, clipStats) => clipStats?.isFile() && !SETTINGS_DATA_SCHEMA['clipsFormat']['enum'].includes(path.extname(clipPath).toLowerCase().replace('.', '')), 'ignoreInitial': true, 'awaitWriteFinish': { stabilityThreshold: WATCHER_STABILITY_THRESHOLD, pollInterval: WATCHER_POLL_INTERVAL }, 'depth': 0});
                    
                    // load the clips watcher listeners
                    setWatchL(false);  // boolean1 isCaps
                }
                else {
                    return stgs.get('clipsDirectory');
                }

                break;

            case 'clipsLimit':
                // save the setting
                stgs.set(key, value);

                // check if the storage limit has been exceeded
                await checkDirSize(false);  // boolean1 isCaps

                // return the value to the renderer process to show in the setting field
                return value;

                break;

            case 'speaker':
                // set the new speaker, or set to default
                if (value !== 'Default') {
                    await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', { 'inputName': SPEAKER_INPUT_NAME, 'inputUuid': spkInpUuid, 'inputSettings': { 'device_id': devs['outs'][value] }, 'overlay': true }));
                }
                else {
                    await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', { 'inputName': SPEAKER_INPUT_NAME, 'inputUuid': spkInpUuid, 'inputSettings': { }, 'overlay': false }));
                }

                break;

            case 'speakerVolume':
                // set the new speaker volume
                await atmpAsyncFunc(() => sendWebSocketReq('SetInputVolume', { 'inputName': SPEAKER_INPUT_NAME, 'inputUuid': spkInpUuid, 'inputVolumeDb': value * 100 - 100 }));

                break;

            case 'microphone':
                // set the new microphone, or set to default
                if (stgs.get('microphone') !== 'Default') {
                    await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', { 'inputName': MICROPHONE_INPUT_NAME, 'inputUuid': micInpUuid, 'inputSettings': { 'device_id': devs['inps'][value] }, 'overlay': true }));
                }
                else {
                    await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', { 'inputName': MICROPHONE_INPUT_NAME, 'inputUuid': micInpUuid, 'inputSettings': { }, 'overlay': false }));
                }

                break;

            case 'microphoneVolume':
                // set the new microphone volume
                await atmpAsyncFunc(() => sendWebSocketReq('SetInputVolume', { 'inputName': MICROPHONE_INPUT_NAME, 'inputUuid': micInpUuid, 'inputVolumeDb': value * 100 - 100 }));

                break;
        }
    
        // save the setting
        stgs.set(key, value);

        // return the value to the renderer process to show in the setting field
        return value;
    });
}

/**
 * Sets the videos watcher listeners
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function setWatchL(isCaps) {
    // get the captures or clips variable
    const videosWatch = isCaps ? capsWatch : clipsWatch;

    // on add, log that a video has been added and request the renderer to add the new video
    videosWatch.on('add', async (videoPath) => {
        // get the captures or clips variables
        const videos = isCaps ? caps : clips;
        const videosCounts = isCaps ? capsCounts : clipsCounts;
        // get the video (data)
        const video = await getVideo(path.basename(videoPath), isCaps);

        // log that a new file was added to the captures or clips directory
        addLog('Settings', 'ADD', 'New file added to the directory', false);  // boolean1 isFinalMsg
        addLog('Settings', 'ADD', `isCaps: ${isCaps}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLog('Settings', 'ADD', `filePath: ${videoPath}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // check if the video is not corrupted
        if (video !== null) {
            // update the normal count and size
            videosCounts['normal']++;
            videosCounts['size'] += video['data']['size'];

            // add the video to the captures or clips
            videos.push(video);

            // add the new video to the gallery
            sendIPC('stgs:reqAddVideo', video, isCaps);

            // check if the storage limit has been exceeded
            await checkDirSize(isCaps);
        }
    });

    // on unlink, log that a video has been deleted and request the renderer to remove the video
    videosWatch.on('unlink', async (videoPath) => {
        // get the captures or clips variables
        const videos = isCaps ? caps : clips;
        const videosCounts = isCaps ? capsCounts : clipsCounts;
        const videosTbnlDir = isCaps ? CAPTURES_THUMBNAIL_DIRECTORY : CLIPS_THUMBNAIL_DIRECTORY;

        // get the index of the video
        const index = videos.findIndex(video => video['data']['path'] === videoPath);

        // log that a new file was deleted from the captures or clips directory
        addLog('Settings', 'DEL', 'File deleted from the directory', false);  // boolean1 isFinalMsg
        addLog('Settings', 'DEL', `isCaps: ${isCaps}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLog('Settings', 'DEL', `videoPath: ${videoPath}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // check if the video was found
        if (index !== -1) {
            // decrease the normal video count and size
            videosCounts['normal']--;
            videosCounts['size'] -= videos[index]['data']['size'];

            // remove the video from the videos array
            videos.splice(index, 1);

            // request the renderer to remove the video from the gallery
            sendIPC('stgs:reqDelVideo', path.basename(videoPath), isCaps);

            // delete the thumbnail image
            atmpAsyncFunc(() => fs.unlink(path.join(videosTbnlDir, `${path.parse(videoPath).name}.png`)), 1);
        }
    });
}

/**
 * Gets the data of the video
 * 
 * @param {string} video - The video to get the data of
 * @param {boolean} isCaps - If the call is for captures or clips
 * @returns {Object} The video (data)
 */
async function getVideo(video, isCaps) {
    // turn ffprobe into a promise based function and get the basic video data
    const ffprobeProm = promisify(ffmpeg.ffprobe);
    const videoName = path.parse(video).name;
    const videoParsedName = video.split('-CC');
    const videoPath = path.join(stgs.get(isCaps ? 'capturesDirectory' : 'clipsDirectory'), video);
    const videoStats = await atmpAsyncFunc(() => fs.stat(videoPath));
    const videosTbnlDir = isCaps ? CAPTURES_THUMBNAIL_DIRECTORY : CLIPS_THUMBNAIL_DIRECTORY;
    const videoTbnlPath = path.join(videosTbnlDir, `${videoName}.png`);
    const videoProbe = await atmpAsyncFunc(() => ffprobeProm(videoPath), 1, 2000);

    // check if the file is not corrupted and the data can be read
    if (videoProbe) {
        // check if the thumbnail for this video already exists
        if (!(await atmpAsyncFunc(() => fs.access(videoTbnlPath)))) {
            // create the thumbnail
            await atmpAsyncFunc(() => new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .screenshots({
                        'timestamps': ['50%'],
                        'filename': videoName,
                        'folder': videosTbnlDir,
                        'size': THUMBNAIL_SIZE
                    });
            }));
        }

        // return the data on the video
        return {
            'data': { 
                'date': videoStats.birthtime, 
                'dur': videoProbe.format.duration, 
                'prog': videoParsedName[1] ? videoParsedName[0] : 'External',  // set the program to External if it cannot be parsed
                'fullName': video, 
                'fps': videoProbe.streams.find(stream => stream.codec_type === 'video').r_frame_rate.split('/').map(Number).reduce((a, b) => a / b),  // get the video fps
                'path': videoPath, 
                'size': videoStats.size, 
                'tbnlPath': videoTbnlPath 
            }
        };
    }
    else {
        return null;
    }
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

    // iterate through each device and get the device name
    JSON.parse(stdout).forEach(dev => {
        if (/microphone|line in/i.test(dev.Name)) {
            inps[dev['Name']] = dev.DeviceID.replace(/^SWD\\MMDEVAPI\\/, '').trim().toLowerCase();
        }
        else {
            outs[dev['Name']] = dev.DeviceID.replace(/^SWD\\MMDEVAPI\\/, '').trim().toLowerCase();
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
    // try to get the list of displays
    try {
        return JSON.parse(await atmpAsyncFunc(() => fs.readFile(RUNTIME_DISPLAYS_PATH)));
    } 
    catch (error) {
        // log that the list of displays could not be read
        addLog('Settings', 'ERROR', 'Cannot get list of displays', false);  // boolean1 isFinalMsg
        addLog('Settings', 'ERROR', `Error message: ${error}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    }
}

/**
 * Gets a setting value
 * 
 * @param {string} stg - The name of the setting
 * @param {boolean | number | string} The value of the setting
 */
export function getStg(stg) {
    return stgs.get(stg);
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
 * Checks if the captures or clips directory storage limit has been exceeded and removes the oldest video(s)
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
async function checkDirSize(isCaps) {
    // get the captures or clips variables
    const videos = isCaps ? caps : clips;
    const videosCounts = isCaps ? capsCounts : clipsCounts;
    const videosLimitStr = isCaps ? 'capturesLimit' : 'clipsLimit';

    // sort the videos in descending order by date
    videos.sort((a, b) => b['data']['date'] - a['data']['date']);

    // check if the storage is being limited
    if (stgs.get(videosLimitStr) !== 0) {
        // get the videos list length, removal size, and removal array
        let i = videos.length;
        let remSize = 0;
        const remVideos = [];

        // continue while the storage limit is exceeded
        while (videosCounts['size'] - remSize > stgs.get(videosLimitStr) * BYTES_IN_GIGABYTE) {
            // decrement the index
            i -= 1;

            // get the video at the index
            const video = videos[i];
            
            // increment the removed size variable and add the video to the removed array
            remSize += video['data']['size'];
            remVideos.push(video);
        }

        // iterate through each video in the removed videos array
        for (const remVideo of remVideos) {
            // delete the video
            await atmpAsyncFunc(() => fs.unlink(remVideo['data']['path']));
        }
    }
}

/**
 * Checks if certain programs are running and toggle recording
 */
async function checkProgs() {
    // get the process and programs lists
    const procs = await atmpAsyncFunc(() => psList());
    const progs = stgs.get('programs');

    // check if recording is on
    if (getIsRec()) {
        // check if the recording program is not running or the program is not in the list
        if (!progs[recProgName] || (recProgName && !procs.some(proc => proc.name === progs[recProgName]['fullName']))) {
            // request a call to setRecBarBtnState on the renderer process
            sendIPC('stgs:reqSetRecBarBtnState');
        }
    }
    else {
        // iterate through each program
        for (const [progName, progInfo] of Object.entries(progs)) {
            // check the program list for a match
            if (procs.some(proc => proc.name === progInfo['fullName'])) {
                // set the recording program
                recProgName = progName;

                // request a call to setRecBarBtnState on the renderer process
                sendIPC('stgs:reqSetRecBarBtnState', recProgName);

                break;
            }
        }
    }
}

/**
 * Sets the auto recording state
 */
function setAutoRecState() {
    // if auto recording is on, start checking the programs list periodically; else, cancel the auto recording
    stgs.get('autoRecord') ? checkProgsIntvId = setInterval(checkProgs, CHECK_PROGRAMS_DELAY) : clearInterval(checkProgsIntvId);
}