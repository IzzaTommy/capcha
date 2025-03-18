/**
 * Module for initializing the settings for the main process
 * 
 * @module mainSettings
 * @requires child_process
 * @requires electron
 * @requires electron-store
 * @requires extract-file-icon
 * @requires fs
 * @requires path
 * @requires util
 * @requires mainGeneral
 * @requires mainWebSocket
 * @requires mainDirectoriesSection
 */
import { exec } from 'child_process';
import { app, dialog, ipcMain } from 'electron';
import Store from 'electron-store';
import extract from 'extract-file-icon';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, addLogMsg, atmpAsyncFunc } from './mainGeneral.js';
import { sendWebSocketReq, sendWebSocketBatchReq, checkProgs } from './mainWebSocket.js';
import { CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, startWatch, checkDirSize } from './mainDirectoriesSection.js';

// settings constants
// active directory
const ACTIVE_DIRECTORY = import.meta.dirname;

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
const SETTINGS_DATA_DEF = { 
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

    'capturesDirectory': path.join(app.getPath('videos'), 'CapCha', 'Captures'),
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

    'clipsDirectory': path.join(app.getPath('videos'), 'CapCha', 'Clips'),
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
const RECORDING_ENCODER_PATH = path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'obs-studio', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json');
const RUNTIME_DISPLAYS_PATH = path.join(ACTIVE_DIRECTORY, '..', 'monitors.json');

// default profile, scene, speaker, microphone, and display input names, check programs delay
const PROFILE_NAME = 'CapCha';
const SCENE_NAME = 'CapCha';
const SPEAKER_INPUT_NAME = 'Speaker Input';
const MICROPHONE_INPUT_NAME = 'Microphone Input';
const DISPLAY_INPUT_NAME = 'Display Input';
const CHECK_PROGRAMS_DELAY = 5000;

// settings state
let checkProgsIntvId;

// settings uuids, ids, scenes, and inputs
let sceneUuid, spkInpUuid, micInpUuid, dispInpUuid, dispInpItemId, scenes, inps;

// settings, devices, displays, captures, and clips
let stgs, devs, disps;

/**
 * Initializes the settings variables
 */
export function initMainStgsVars() {
    // check programs interval id
    checkProgsIntvId = -1;

    // scene, speaker, microphone, and display input uuids and item ids, scenes, and inputs lists
    sceneUuid = '';
    spkInpUuid = '';
    micInpUuid = '';
    dispInpUuid = '';
    dispInpItemId = -1;
    scenes = [];
    inps = [];

    // settings, displays, devices, caps, clips videos and counts
    stgs = null;
    disps = {};
    devs = {};
}

/**
 * Initializes the settings for electron-store and OBS
 */
export async function initMainStgs() {
    // initialize the settings
    await initStgs();

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
        stgs = new Store({ 'defaults': SETTINGS_DATA_DEF, 'schema': SETTINGS_DATA_SCHEMA });
    }
    // error will occur if the file cannot be read, has corrupted values, or has invalid values (which should only occur if the user manually tampered with it)
    catch (error) {
        // log that the settings could not be read
        addLogMsg('Settings', 'ERROR', 'Configuration file cannot be read', false);  // boolean1 isFinalMsg
        addLogMsg('Settings', 'ERROR', `Error message: ${error['message']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // delete the corrupted file
        await atmpAsyncFunc(() => fs.unlink(SETTINGS_CONFIG_PATH), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to delete the corrupted settings!', true);

        // log that the configuration file was deleted
        addLogMsg('Settings', 'ERROR', 'Deleting the corrupt configuration file', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // reinitialize the settings with the default values
        stgs = new Store({ 'defaults': SETTINGS_DATA_DEF, 'schema': SETTINGS_DATA_SCHEMA });

        // log that the settings were reinitialized
        addLogMsg('Settings', 'ERROR', 'Reinitializing settings with default values', true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    }

    // check if the CapCha profile does not exist
    if (!(await atmpAsyncFunc(() => sendWebSocketReq('GetProfileList'), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to get the list of profiles!', true))['responseData']['profiles'].includes(PROFILE_NAME)) {
        // create the CapCha profile
        await atmpAsyncFunc(() => sendWebSocketReq('CreateProfile', { 'profileName': PROFILE_NAME }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to create the CapCha profile!', true);
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
            'requestData': { 'parameterCategory': 'Video', 'parameterName': 'FPSType', 'parameterValue': '2' } 
        }, 
        // set the recording path, format, encoder, width, height, and FPS
        {
            'requestType': 'SetRecordDirectory', 
            'requestData': { 'recordDirectory': stgs.get('capturesDirectory') } 
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
            'requestType': 'SetVideoSettings', 
            'requestData': { 'fpsNumerator': stgs.get('capturesFramerate'), 'fpsDenominator': 1, 'baseWidth': stgs.get('capturesWidth'), 'baseHeight': stgs.get('capturesHeight'), 'outputWidth': stgs.get('capturesWidth'), 'outputHeight': stgs.get('capturesHeight') }
        } 
    ]), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set initial profile settings!', true);

    // try to set the bitrate by manipulating the file with bitrate information
    await atmpAsyncFunc(() => fs.writeFile(RECORDING_ENCODER_PATH, JSON.stringify(
        stgs.get('capturesEncoder') == 'obs_x264' 
        ? { 'bitrate': stgs.get('capturesBitrate') } 
        : { 'rate_control': 'CBR', 'bitrate': stgs.get('capturesBitrate') }
    )), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the initial bitrate!', true);

    // get the list of scenes and inputs
    scenes = (await atmpAsyncFunc(() => sendWebSocketReq('GetSceneList'), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to get the list of scenes!', true))['responseData']['scenes'];
    inps = (await atmpAsyncFunc(() => sendWebSocketReq('GetInputList', { }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to get the list of inputs!', true))['responseData']['inputs'];

    // create the CapCha scene if it doesn't exist
    sceneUuid = scenes.some(scene => scene['sceneName'] === SCENE_NAME) 
        ? scenes[scenes.findIndex(scene => scene['sceneName'] === SCENE_NAME)]['sceneUuid'] 
        : (await atmpAsyncFunc(() => sendWebSocketReq('CreateScene', { 'sceneName': SCENE_NAME }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to create the CapCha scene!', true))['responseData']['sceneUuid'];

    // set the scene to the CapCha scene
    await atmpAsyncFunc(() => sendWebSocketReq('SetCurrentProgramScene', { 'sceneName': SCENE_NAME, 'sceneUuid': sceneUuid }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the current scene!', true);
    
    // mute the desktop audio (they appear by default and will be redundant)
    if (inps.some(input => input['inputName'] === 'Desktop Audio')) {
        await atmpAsyncFunc(() => sendWebSocketReq('SetInputMute', 
            { 
                'inputName': 'Desktop Audio', 
                'inputUuid': inps[inps.findIndex(input => input['inputName'] === 'Desktop Audio')]['inputUuid'], 'inputMuted': true 
            }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to mute the desktop audio!', true);
    }

    // mute the mic/aux (they appear by default and will be redundant)
    if (inps.some(input => input['inputName'] === 'Mic/Aux')) {
        await atmpAsyncFunc(() => sendWebSocketReq('SetInputMute', 
            { 
                'inputName': 'Mic/Aux', 
                'inputUuid': inps[inps.findIndex(input => input['inputName'] === 'Mic/Aux')]['inputUuid'], 'inputMuted': true 
            }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to mute the mic/aux!', true);
    }

    // create the speaker input if it does not exist
    spkInpUuid = inps.some(input => input['inputName'] === SPEAKER_INPUT_NAME) 
        ? inps[inps.findIndex(input => input['inputName'] === SPEAKER_INPUT_NAME)]['inputUuid'] 
        : (await atmpAsyncFunc(() => sendWebSocketReq('CreateInput', 
            { 
                'sceneName': SCENE_NAME, 
                'sceneUuid': sceneUuid, 
                'inputName': SPEAKER_INPUT_NAME, 
                'inputKind': 'wasapi_output_capture', 
                'inputSettings': { }, 
                'sceneItemEnabled': true 
            }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to create the speaker input!', true))['responseData']['inputUuid'];

    // check if the speaker is not the default speaker and the speaker is currently available
    if (stgs.get('speaker') !== 'Default' && stgs.get('speaker') in devs['outs']) {
        // set the speaker to the device in the settings
        await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', 
            { 
                'inputName': SPEAKER_INPUT_NAME, 
                'inputUuid': spkInpUuid, 
                'inputSettings': { 'device_id': devs['outs'][stgs.get('speaker')] }, 
                'overlay': true 
            }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the speaker input device!', true);
    }
    // else, set the speaker to the default
    else {
        stgs.set('speaker', 'Default');
        await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', 
            { 
                'inputName': SPEAKER_INPUT_NAME, 
                'inputUuid': spkInpUuid, 
                'inputSettings': { }, 
                'overlay': false 
            }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the speaker input device!', true);
    }

    // set the speaker volume
    await atmpAsyncFunc(() => sendWebSocketReq('SetInputVolume', 
        { 
            'inputName': SPEAKER_INPUT_NAME, 
            'inputUuid': spkInpUuid, 
            'inputVolumeDb': stgs.get('speakerVolume') * 100 - 100 
        }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the speaker input volume!', true);

    // create the microphone input if it does not exist
    micInpUuid = inps.some(input => input['inputName'] === MICROPHONE_INPUT_NAME) 
        ? inps[inps.findIndex(input => input['inputName'] === MICROPHONE_INPUT_NAME)]['inputUuid'] 
        : (await atmpAsyncFunc(() => sendWebSocketReq('CreateInput', 
            { 
                'sceneName': SCENE_NAME, 
                'sceneUuid': sceneUuid, 
                'inputName': MICROPHONE_INPUT_NAME, 
                'inputKind': 'wasapi_input_capture', 
                'inputSettings': { }, 
                'sceneItemEnabled': true 
            }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to create the microphone input!', true))['responseData']['inputUuid'];
    
    // check if the microphone is not the default microphone and the microphone is currently available
    if (stgs.get('microphone') !== 'Default' && stgs.get('microphone') in devs['inps']) {
        // set the microphone to the device in the settings
        await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', 
            { 
                'inputName': MICROPHONE_INPUT_NAME, 
                'inputUuid': micInpUuid, 
                'inputSettings': { 'device_id': devs['inps'][stgs.get('microphone')] }, 
                'overlay': true 
            }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the microphone input device!', true);
    }
    // else, set the microphone to the default
    else {
        stgs.set('microphone', 'Default');
        await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', 
            { 
                'inputName': MICROPHONE_INPUT_NAME, 
                'inputUuid': micInpUuid, 
                'inputSettings': { }, 
                'overlay': false 
            }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the microphone input device!', true);
    }

    // set the microphone volume
    await atmpAsyncFunc(() => sendWebSocketReq('SetInputVolume', 
        { 
            'inputName': MICROPHONE_INPUT_NAME, 
            'inputUuid': micInpUuid, 
            'inputVolumeDb': stgs.get('microphoneVolume') * 100 - 100 
        }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the microphone input volume!', true);

    // create the display input if it does not exist
    dispInpUuid = inps.some(input => input['inputName'] === DISPLAY_INPUT_NAME) 
        ? inps[inps.findIndex(input => input['inputName'] === DISPLAY_INPUT_NAME)]['inputUuid'] 
        : (await atmpAsyncFunc(() => sendWebSocketReq('CreateInput', 
            { 
                'sceneName': SCENE_NAME, 
                'sceneUuid': sceneUuid, 
                'inputName': DISPLAY_INPUT_NAME, 
                'inputKind': 'monitor_capture', 
                'inputSettings': { }, 
                'sceneItemEnabled': true 
            })))['responseData']['inputUuid'];

    // get the display input item id
    dispInpItemId = (await sendWebSocketReq('GetSceneItemId', { 'sceneName': SCENE_NAME, 'sceneUuid': sceneUuid, 'sourceName': DISPLAY_INPUT_NAME }))['responseData']['sceneItemId'];

    // set the display to the device in the settings
    if (stgs.get('capturesDisplay') in disps) {
        await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', 
            { 
                'inputName': DISPLAY_INPUT_NAME, 
                'inputUuid': dispInpUuid, 
                'inputSettings': { 'method': 2, 'monitor_id': '\\\\?\\' + disps[stgs.get('capturesDisplay')]['id'] }, 
                'overlay': true 
            }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to create the display input!', true);

        // set the display input item transform to prevent mispositioning of the recording screen
        await atmpAsyncFunc(() => sendWebSocketReq('SetSceneItemTransform', 
            { 
                'sceneName': SCENE_NAME, 
                'sceneUuid': sceneUuid, 
                'sceneItemId': dispInpItemId, 
                'sceneItemTransform': 
                    { 
                        'alignment': 5, 
                        'boundsAlignment': 0,
                        'boundsHeight': 1, 
                        'boundsType': 'OBS_BOUNDS_NONE',
                        'boundsWidth': 1,
                        'cropBottom': 0, 
                        'cropLeft': 0, 
                        'cropRight': 0, 
                        'cropToBounds': false, 
                        'cropTop': 0, 
                        'height': stgs.get('capturesHeight'), 
                        'positionX': 0, 
                        'positionY': 0, 
                        'rotation': 0, 
                        'scaleX': stgs.get('capturesWidth') / disps[stgs.get('capturesDisplay')]['sizeX'], 
                        'scaleY': stgs.get('capturesHeight') / disps[stgs.get('capturesDisplay')]['sizeY'], 
                        'sourceHeight': disps[stgs.get('capturesDisplay')]['sizeY'], 
                        'sourceWidth': disps[stgs.get('capturesDisplay')]['sizeX'], 
                        'width': stgs.get('capturesWidth')
                    }
            }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the recording screen size!', true);
    }
    else {
        // if the list of displays is empty, set the display to nothing
        if (Object.keys(disps).length === 0) {
            stgs.set('capturesDisplay', '');
        }
        // else, set the display to the first one in the list
        else {
            stgs.set('capturesDisplay', Object.keys(disps)[0]);
            await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', 
                { 
                    'inputName': DISPLAY_INPUT_NAME, 
                    'inputUuid': dispInpUuid, 
                    'inputSettings': { 'method': 2, 'monitor_id': '\\\\?\\' + disps[stgs.get('capturesDisplay')]['id'] }, 
                    'overlay': true 
                }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the display input device!', true);

            // set the display input item transform to prevent mispositioning of the recording screen
            await atmpAsyncFunc(() => sendWebSocketReq('SetSceneItemTransform', 
                { 
                    'sceneName': SCENE_NAME, 
                    'sceneUuid': sceneUuid, 
                    'sceneItemId': dispInpItemId, 
                    'sceneItemTransform': 
                        { 
                            'alignment': 5, 
                            'boundsAlignment': 0,
                            'boundsHeight': 1, 
                            'boundsType': 'OBS_BOUNDS_NONE',
                            'boundsWidth': 1,
                            'cropBottom': 0, 
                            'cropLeft': 0, 
                            'cropRight': 0, 
                            'cropToBounds': false, 
                            'cropTop': 0, 
                            'height': stgs.get('capturesHeight'), 
                            'positionX': 0, 
                            'positionY': 0, 
                            'rotation': 0, 
                            'scaleX': stgs.get('capturesWidth') / disps[stgs.get('capturesDisplay')]['sizeX'], 
                            'scaleY': stgs.get('capturesHeight') / disps[stgs.get('capturesDisplay')]['sizeY'], 
                            'sourceHeight': disps[stgs.get('capturesDisplay')]['sizeY'], 
                            'sourceWidth': disps[stgs.get('capturesDisplay')]['sizeX'], 
                            'width': stgs.get('capturesWidth')
                        }
                }), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to set the recording screen size!', true);
        }
    }
}

/**
 * Initializes the settings listeners
 */
function initStgsL() {
    // on getAllStgs, get all the settings
    ipcMain.handle('stgs:getAllStgs', (_) => stgs.store);
    
    // on getAllDevs, get all the devices
    ipcMain.handle('stgs:getAllDevs', (_) => devs);

    // on getAllDisps, get all the displays
    ipcMain.handle('stgs:getAllDisps', (_) => disps);

    // sets the value of a specific setting
    ipcMain.handle('stgs:setStg', async (_, key, value) => {
        // result of opening the dialog
        let result;

        // log basic information about the setting
        addLogMsg('Settings', 'SET', 'Setting a setting', false);  // boolean1 isFinalMsg
        addLogMsg('Settings', 'SET', `Key: ${key}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLogMsg('Settings', 'SET', `Value: ${JSON.stringify(value)}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLogMsg('Settings', 'SET', `Type: ${typeof(value)}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // validate the setting type and value
        value = validStg(key, value);

        // log the validated setting value and type
        addLogMsg('Settings', 'SET', `Validated value: ${JSON.stringify(value)}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLogMsg('Settings', 'SET', `Validated type: ${typeof(value)}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

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

                    // try to access the new directory
                    try {
                        await atmpAsyncFunc(() => fs.access(value))
                    }
                    catch (_) {
                        // reverts to the default setting since the directory does not exist
                        value = SETTINGS_DATA_DEF[key];
                    }

                    // sets the new captures directory
                    await atmpAsyncFunc(() => sendWebSocketReq('SetRecordDirectory', { 'recordDirectory': value }));

                    // start the captures watcher
                    await startWatch(value, true);  // boolean1 isCaps
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
                await atmpAsyncFunc(() => fs.writeFile(RECORDING_ENCODER_PATH, JSON.stringify(value === 'obs_x264' 
                    ? { 'bitrate': stgs.get('capturesBitrate') } 
                    : { 'rate_control': 'CBR', 'bitrate': stgs.get('capturesBitrate') }), { })
                );

                break;

            case 'capturesWidth':
                // sets the new captures width
                await atmpAsyncFunc(() => sendWebSocketReq('SetVideoSettings', { 'baseWidth': value, 'baseHeight': stgs.get('capturesHeight'), 'outputWidth': value, 'outputHeight': stgs.get('capturesHeight') }));

                break;

            case 'capturesHeight':
                // sets the new captures height
                await atmpAsyncFunc(() => sendWebSocketReq('SetVideoSettings', { 'baseWidth': stgs.get('capturesWidth'), 'baseHeight': value, 'outputWidth': stgs.get('capturesWidth'), 'outputHeight': value }));

                break;

            case 'capturesDisplay':
                // set the new captures display
                await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', 
                    { 
                        'inputName': DISPLAY_INPUT_NAME, 
                        'inputUuid': dispInpUuid, 
                        'inputSettings': { 'method': 2, 'monitor_id': '\\\\?\\' + disps[value]['id'] }, 
                        'overlay': true 
                    }));

                break;

            case 'capturesFramerate':
                // set the new captures framerate
                await atmpAsyncFunc(() => sendWebSocketReq('SetVideoSettings', { 'fpsNumerator': value, 'fpsDenominator': 1 }));

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
                result = await atmpAsyncFunc(() => dialog.showOpenDialog({ 'properties': ['openFile'], 'filters': [{ 'name': 'Executable', 'extensions': ['exe', 'app'] }] }));
            
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

                    // try to access the new directory
                    try {
                        await atmpAsyncFunc(() => fs.access(value))
                    }
                    catch (_) {
                        // reverts to the default setting since the directory does not exist
                        value = SETTINGS_DATA_DEF[key];
                    }

                    // start the clips watcher
                    await startWatch(value, false);  // boolean1 isCaps
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
                    await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', 
                        { 
                            'inputName': SPEAKER_INPUT_NAME, 
                            'inputUuid': spkInpUuid, 
                            'inputSettings': { 'device_id': devs['outs'][value] }, 
                            'overlay': true 
                        }));
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
                    await atmpAsyncFunc(() => sendWebSocketReq('SetInputSettings', 
                        { 
                            'inputName': MICROPHONE_INPUT_NAME, 
                            'inputUuid': micInpUuid, 
                            'inputSettings': { 'device_id': devs['inps'][value] }, 
                            'overlay': true 
                        }));
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

    // on reqSetAutoRecState, call setAutoRecState
    ipcMain.handle('stgs:reqSetAutoRecState', setAutoRecState); 
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
        if (/microphone|line in/i.test(dev['Name'])) {
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
        addLogMsg('Settings', 'ERROR', 'Cannot get list of displays', false);  // boolean1 isFinalMsg
        addLogMsg('Settings', 'ERROR', `Error message: ${error['message']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
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
 * Gets the settings data schema
 * 
 * @returns {Object} The settings data schema
 */
export function getStgsDataSchema() {
    return SETTINGS_DATA_SCHEMA;
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
                value = SETTINGS_DATA_DEF[key];
            }

            break;

        case 'number':
            // if the value is not a number, revert to the default value
            if (isNaN(value)) {
                value = SETTINGS_DATA_DEF[key];
            }
            else {
                // if the key has an enumeration, ensure the value is in it, or revert to the default value
                if (SETTINGS_DATA_SCHEMA[key]['enum']) {
                    value = !SETTINGS_DATA_SCHEMA[key]['enum'].includes(Number(value)) ? SETTINGS_DATA_DEF[key] : Number(value);
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
                value = SETTINGS_DATA_DEF[key];
            }

            break;

        case 'string':
            // if the type is not string or the value is not un the enumeration, revert to the default value
            if (typeof(value) !== 'string' || (SETTINGS_DATA_SCHEMA[key]['enum'] && !SETTINGS_DATA_SCHEMA[key]['enum'].includes(value))) {
                value = SETTINGS_DATA_DEF[key];
            }
        
            break;
    }    

    return value;
}

/**
 * Sets the auto recording state
 */
function setAutoRecState() {
    // if auto recording is on, start checking the programs list periodically; else, cancel the auto recording
    stgs.get('autoRecord') ? checkProgsIntvId = setInterval(checkProgs, CHECK_PROGRAMS_DELAY) : clearInterval(checkProgsIntvId);
}