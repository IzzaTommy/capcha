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
 * @exports ACTIVE_DIRECTORY, MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, MAIN_WINDOW_ICON_PATH, PRELOAD_PATH, INDEX_PATH, 
 *  CLIP_FRAMERATE, CLIP_VIDEO_BITRATE, CLIP_AUDIO_CODEC, CLIP_AUDIO_BITRATE, CLIP_AUDIO_CHANNELS, CLIP_THREADS, CLIP_VIDEO_CODEC, 
 *  CHECK_PROGRAMS_DELAY_IN_MSECONDS, TIME_PAD, EVENT_PAD, LOGS_PATH, LOGS_DIV, 
 *  OBS_EXECUTABLE_PATH, CAPTURES_DATE_FORMAT, 
 *  SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
 *  CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, THUMBNAIL_SIZE, 
 *  SETTINGS_CONFIG_PATH, SETTINGS_DATA_SCHEMA, SETTINGS_DATA_DEFS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
 *  ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
 *  data, flags, insts, progs, states, uuids 
 */
export { 
    ACTIVE_DIRECTORY, MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, MAIN_WINDOW_ICON_PATH, PRELOAD_PATH, INDEX_PATH, 
    CLIP_FRAMERATE, CLIP_VIDEO_BITRATE, CLIP_AUDIO_CODEC, CLIP_AUDIO_BITRATE, CLIP_AUDIO_CHANNELS, CLIP_THREADS, CLIP_VIDEO_CODEC, 
    CHECK_PROGRAMS_DELAY_IN_MSECONDS, TIME_PAD, EVENT_PAD, LOGS_PATH, LOGS_DIV, 
    OBS_EXECUTABLE_PATH, CAPTURES_DATE_FORMAT, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, THUMBNAIL_SIZE, 
    SETTINGS_CONFIG_PATH, SETTINGS_DATA_SCHEMA, SETTINGS_DATA_DEFS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    data, flags, insts, progs, states, uuids 
};

// unexported
const INITIALIZATION_DATE = new Date();
const CAPTURES_DIRECTORY_DEF = path.join(app.getPath('videos'), 'CapCha', 'Captures');
const CLIPS_DIRECTORY_DEF = path.join(app.getPath('videos'), 'CapCha', 'Clips');

// active directory
const ACTIVE_DIRECTORY = import.meta.dirname;  // CC-Electron/src/main

// minimum window size, paths
const MAIN_WINDOW_WIDTH_MIN = 1280;
const MAIN_WINDOW_HEIGHT_MIN = 900;
const MAIN_WINDOW_ICON_PATH = path.join(ACTIVE_DIRECTORY, '..', 'assets', 'app-icon', 'capcha-app-icon.png');
const PRELOAD_PATH = path.join(ACTIVE_DIRECTORY, 'preload.js');
const INDEX_PATH = 'src/renderer/index.html';

// clip parameters
const CLIP_FRAMERATE = 30;
const CLIP_VIDEO_BITRATE = '4000k';
const CLIP_AUDIO_CODEC = 'aac';
const CLIP_AUDIO_BITRATE = '96k';
const CLIP_AUDIO_CHANNELS = 1;
const CLIP_THREADS = '-threads 2';
const CLIP_VIDEO_CODEC = 'h264_nvenc';

// delay, padding functions, log paths, log divider
const CHECK_PROGRAMS_DELAY_IN_MSECONDS = 5000;
const TIME_PAD = (time) => time.toString().padStart(2, '0');
const EVENT_PAD = (event) => event.toString().padEnd(5, '-');
const LOGS_PATH = path.join(app.getPath('logs'), `${INITIALIZATION_DATE.getFullYear()}-${TIME_PAD(INITIALIZATION_DATE.getMonth() + 1)}-${TIME_PAD(INITIALIZATION_DATE.getDate())}_${TIME_PAD(INITIALIZATION_DATE.getHours())}-${TIME_PAD(INITIALIZATION_DATE.getMinutes())}-${TIME_PAD(INITIALIZATION_DATE.getSeconds())}.txt`);
const LOGS_DIV = '------------------------------------------------------------';

// obs executable path, date format
const OBS_EXECUTABLE_PATH = path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'bin', '64bit', 'obs64.exe');
const CAPTURES_DATE_FORMAT = '%MM%DD%YY%hh%mm%ss';

// obs input names, thumbnail directories, thumbnail size
const SCENE_NAME = 'CapCha';
const SPEAKER_INPUT_NAME = 'CapCha Input';
const MICROPHONE_INPUT_NAME = 'CapCha Output';

const CAPTURES_THUMBNAIL_DIRECTORY = path.join(app.getPath('userData'), 'Thumbnails', 'Captures');
const CLIPS_THUMBNAIL_DIRECTORY = path.join(app.getPath('userData'), 'Thumbnails', 'Clips');
const THUMBNAIL_SIZE = '320x180';

// settings config file path, settings schema and defaults, encoder path, shell devices command
const SETTINGS_CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
const SETTINGS_DATA_SCHEMA = { 
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

    videoVolume: {
        type: 'number',
        minimum: 0,
        maximum: 1,
    },
    videoVolumeMuted: {
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
const SETTINGS_DATA_DEFS = { 
    navigationBarActive: true,
    
    capturesGameFilter: 'all',
    capturesMetaFilter: 'date',
    capturesAscending: false,

    clipsGameFilter: 'all',
    clipsMetaFilter: 'date',
    clipsAscending: false,

    videoVolume: 0.1,
    videoVolumeMuted: true,

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
    inps: null, 
    scenes: null, 
    stgs: null, 
    videos: null 
};

// boolean flags
const flags = { 
    isRec: false 
};

// instances
const insts = { 
    mainWindow: null, 
    obsProcess: null, 
    webSocket: null 
};

// auto record programs
const progs = {};

// states data
const states = { 
    autoRecIntv: null, 
    recGame: null, 
    pendReqs: new Map() 
};

// device uuids
const uuids = {
    micInp: null, 
    scene: null, 
    spkInp: null 
};