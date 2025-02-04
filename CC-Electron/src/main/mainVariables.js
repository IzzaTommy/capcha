/**
 * Module for initializing the variabels for the main process
 * 
 * @module mainVariables
 * @requires electron
 * @requires path
 */
import { app } from 'electron';
import path from 'path';

/**
 * @exports MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, CHECK_PROGRAMS_DELAY_IN_MSECONDS, PAD, LOGS_PATH, LOGS_DIVIDER, THUMBNAIL_SIZE, 
 *  ACTIVE_DIRECTORY, CAPTURES_DIRECTORY_DEF, CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_DIRECTORY_DEF, CLIPS_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
 *  CAPTURES_DATE_FORMAT, 
 *  SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
 *  SETTINGS_PATH_DEF, STGS_DATA_SCHEMA, STGS_DATA_DEFAULTS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
 *  ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
 *  data, flags, inst, progs, state, uuid 
 */
export { 
    MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, CHECK_PROGRAMS_DELAY_IN_MSECONDS, PAD, LOGS_PATH, LOGS_DIVIDER, THUMBNAIL_SIZE, 
    ACTIVE_DIRECTORY, CAPTURES_DIRECTORY_DEF, CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_DIRECTORY_DEF, CLIPS_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
    CAPTURES_DATE_FORMAT, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    SETTINGS_PATH_DEF, STGS_DATA_SCHEMA, STGS_DATA_DEFAULTS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    data, flags, inst, progs, state, uuid 
};

// unexported
const INITIALIZATION_DATE = new Date();

// minimum window size, delays, logs path
const MAIN_WINDOW_WIDTH_MIN = 1280;
const MAIN_WINDOW_HEIGHT_MIN = 900;
const CHECK_PROGRAMS_DELAY_IN_MSECONDS = 5000;
const PAD = (num) => num.toString().padStart(2, '0');
const LOGS_PATH = path.join(app.getPath('logs'), `${INITIALIZATION_DATE.getFullYear()}-${PAD(INITIALIZATION_DATE.getMonth() + 1)}-${PAD(INITIALIZATION_DATE.getDate())}_${PAD(INITIALIZATION_DATE.getHours())}-${PAD(INITIALIZATION_DATE.getMinutes())}-${PAD(INITIALIZATION_DATE.getSeconds())}.txt`);
const LOGS_DIVIDER = '------------------------------------------------------------';

// thumbnail size
const THUMBNAIL_SIZE = '320x180';

// directories and paths
const ACTIVE_DIRECTORY = import.meta.dirname;  // CC-Electron/src/main
const CAPTURES_DIRECTORY_DEF = path.join(app.getPath('videos'), 'CapCha', 'Captures');  // not used?
const CAPTURES_THUMBNAIL_DIRECTORY = path.join(app.getPath('userData'), 'Thumbnails', 'Captures');  // not used?
const CLIPS_DIRECTORY_DEF = path.join(app.getPath('videos'), 'CapCha', 'Clips');  // not used?
const CLIPS_THUMBNAIL_DIRECTORY = path.join(app.getPath('userData'), 'Thumbnails', 'Clips');  // not used?
const OBS_EXECUTABLE_PATH = path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'bin', '64bit', 'obs64.exe');

const CAPTURES_DATE_FORMAT = '%MM%DD%YY%hh%mm%ss';

// OBS input names
const SCENE_NAME = 'CapCha';
const SPEAKER_INPUT_NAME = 'CapCha Input';
const MICROPHONE_INPUT_NAME = 'CapCha Output';

// settings
const SETTINGS_PATH_DEF = path.join(app.getPath('userData'), 'config.json');
const STGS_DATA_SCHEMA = { 
    navigationBarActive: {
        type: 'boolean'
    },

    capturesGameFilter: {
        type: 'string'
    },
    capturesMetaFilter: {
        type: 'string',
        enum: ['name', 'date', 'size', 'duration']
    },
    capturesAscending: {
        type: 'boolean'
    },

    clipsGameFilter: {
        type: 'string'
    },
    clipsMetaFilter: {
        type: 'string',
        enum: ['name', 'date', 'size', 'duration']
    },
    clipsAscending: {
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

    capturesDirectory: {
        type: 'string'
    },
    capturesLimit: {
        type: 'number',
        enum: [0, 5, 10, 20, 50, 100, 200, 500]
    },
    capturesFormat: {
        type: 'string',
        enum: ['mp4', 'mkv']
    },
    capturesEncoder: {
        type: 'string',
        enum: ['obs_nvenc_h264_tex', 'obs_nvenc_hevc_tex', 'obs_x264']
    },
    capturesWidth: {
        type: 'number',
        minimum: 1,
        maximum: 4096
    },
    capturesHeight: {
        type: 'number',
        minimum: 1,
        maximum: 4096
    },
    capturesDisplay: {
        type: 'string'
    },
    capturesFramerate: {
        type: 'number',
        enum: [10, 20, 24, 30, 48, 60]
    },
    capturesBitrate: {
        type: 'number',
        enum: [3000, 5000, 10000, 15000, 20000, 30000, 50000, 100000]
    },
    autoRecord: {
        type: 'boolean'
    }, 

    clipsDirectory: {
        type: 'string'
    },
    clipsLimit: {
        type: 'number',
        enum: [0, 5, 10, 20, 50, 100, 200, 500]
    },
    clipsFormat: {
        type: 'string',
        enum: ['mp4', 'mkv']
    },
    clipsWidth: {
        type: 'number',
        minimum: 1,
        maximum: 4096
    },
    clipsHeight: {
        type: 'number',
        minimum: 1,
        maximum: 4096
    },

    speaker: {
        type: 'string'
    },
    speakerVolume: {
        type: 'number',
        minimum: 0,
        maximum: 1,
    },
    microphone: {
        type: 'string'
    },
    microphoneVolume: {
        type: 'number',
        minimum: 0,
        maximum: 1,
    },
    webcam: {
        type: 'string'
    }
};
const STGS_DATA_DEFAULTS = { 
    navigationBarActive: true,
    
    capturesGameFilter: 'all',
    capturesMetaFilter: 'date',
    capturesAscending: false,

    clipsGameFilter: 'all',
    clipsMetaFilter: 'date',
    clipsAscending: false,

    volume: 0.1,
    volumeMuted: true,

    darkMode: true,

    capturesDirectory: CAPTURES_DIRECTORY_DEF,
    capturesLimit: 50, 
    capturesFormat: 'mp4', 
    capturesEncoder: 'obs_nvenc_h264_tex', 
    capturesWidth: 1280, 
    capturesHeight: 720, 
    capturesDisplay: '', 
    capturesFramerate: 30,
    capturesBitrate: 3000,
    autoRecord: false,

    clipsDirectory: CLIPS_DIRECTORY_DEF,
    clipsLimit: 50, 
    clipsFormat: 'mp4', 
    clipsWidth: 1280, 
    clipsHeight: 720, 

    speaker: 'default',
    speakerVolume: 0.5, 
    microphone: 'default', 
    microphoneVolume: 0.5
    // webcam: ''
};
const RECORD_ENCODER_PATH = path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'config', 'obs-studio', 'basic', 'profiles', 'CapCha', 'recordEncoder.json');
const SHELL_DEVICES_COMMAND = `Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'AudioEndpoint' } | Select-Object Name, DeviceID | ConvertTo-Json -Compress`;

// asynchronous function attempts and delay
const ASYNC_ATTEMPTS = 3;
const ASYNC_DELAY_IN_MSECONDS = 3000;

// video/setting/display/device data
const data = { 
    devs: null, 
    disps: null, 
    inputs: null, 
    scenes: null, 
    stgs: null, 
    videos: null 
};

// boolean flags
const flags = { 
    isRec: false 
};

// instances
const inst = { 
    mainWindow: null, 
    obsProcess: null, 
    webSocket: null 
};

// auto record programs
const progs = {};

// state data
const state = { 
    autoRecIntv: null, 
    recGame: null, 
    pendReqs: new Map() 
};

// device uuids
const uuid = {
    micInput: null, 
    scene: null, 
    spkInput: null 
};