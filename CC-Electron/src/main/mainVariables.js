// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import psList from 'ps-list';
import { exec } from 'child_process';

export { 
    THUMBNAIL_SIZE, 
    ACTIVE_DIRECTORY, DEF_CAPTURES_DIRECTORY, DEF_CLIPS_DIRECTORY, CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
    SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, 
    PROGRAMS, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, 
    instances, flags, 
    data, state, 
    initMainVariables 
};

// thumbnail size
const THUMBNAIL_SIZE = '320x180';

// paths
const ACTIVE_DIRECTORY = import.meta.dirname;
const DEF_CAPTURES_DIRECTORY = path.join(app.getPath('videos'), 'CapCha', 'Captures');
const DEF_CLIPS_DIRECTORY = path.join(app.getPath('videos'), 'CapCha', 'Clips');
const CAPTURES_THUMBNAIL_DIRECTORY = path.join(app.getPath('userData'), 'Thumbnails', 'Captures');
const CLIPS_THUMBNAIL_DIRECTORY = path.join(app.getPath('userData'), 'Thumbnails', 'Clips');
const OBS_EXECUTABLE_PATH = path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'bin', '64bit', 'obs64.exe');

// settings
const SETTINGS_DATA_DEFAULTS = { 
    navBarActive: true,
    
    volume: 0.25,
    volumeMuted: true,

    darkMode: true,

    capturesPath: DEF_CAPTURES_DIRECTORY,
    capturesLimit: 100, 
    capturesFormat: 'mp4', 
    capturesEncoder: 'obs_nvenc_h264_tex', 
    capturesWidth: 1280, 
    capturesHeight: 720, 
    // capturesDisplay: '', 
    capturesFramerate: 60,
    capturesBitrate: 10000,
    autoRecord: false,

    clipsPath: DEF_CLIPS_DIRECTORY,
    clipsLimit: 100, 
    clipsFormat: 'mp4', 
    clipsWidth: 1280, 
    clipsHeight: 720, 

    // speaker: '',
    // microphone: '',
    // webcam: ''
};
const SETTINGS_DATA_SCHEMA = { 
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

    capturesPath: {
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

    clipsPath: {
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
    microphone: {
        type: 'string'
    },
    webcam: {
        type: 'string'
    }
};

// auto record programs
const PROGRAMS = { 
    VALORANT: 'Valorant.exe', 
    Notepad: 'Notepad.exe' 
};

// asynchronous function attempts and delay
const ATTEMPTS = 3;
const FAST_DELAY_IN_MSECONDS = 2000;
const SLOW_DELAY_IN_MSECONDS = 4000;

// main window, obs process, websocket instances
let instances;

// boolean flags, settings/videos data, and state data
let flags, data, state; 

/**
 * Initializes the variables
 */
function initMainVariables() {
    // main window, obs process, and websocket instances
    instances = { 
        mainWindow: null, 
        obsProcess: null, 
        webSocket: null 
    };

    // boolean flags
    flags = { 
        recording: false 
    };
    
    // settings and videos data
    data = { 
        settings: null, 
        videos: null 
    };

    // pending requests for websocket, recording game, and auto record interval
    state = { 
        autoRecordInterval: null, 
        pendingRequests: new Map(), 
        recordingGame: null
    };
}