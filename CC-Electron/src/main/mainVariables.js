// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync, unlinkSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';

import { initMainWindow, initMainWindowL } from './mainWindow.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, initMainWebSocketL } from './mainWebSocket.js';
import { initMainSettings, initMainSettingsL } from './mainSettings.js';
import { config } from 'process';

export { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, instances, pendingRequests, initMainVariables, SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, settingsData };

// constants
const THUMBNAIL_SIZE = '320x180';
const ACTIVE_DIRECTORY = import.meta.dirname;
const DEF_VIDEO_DIRECTORY = path.join(app.getPath('videos'), 'CapCha');
const DEF_THUMBNAIL_DIRECTORY = path.join(app.getPath('userData'), 'thumbnails');
const OBS_EXECUTABLE_PATH = path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'bin', '64bit', 'obs64.exe');
const SETTINGS_DATA_DEFAULTS = {
    navBarActive: true,
    
    volume: 0.25,
    volumeMuted: true,

    darkMode: true,

    capturesPath: DEF_VIDEO_DIRECTORY,
    capturesLimit: 100,
    format: 'mp4',
    encoder: 'obs_nvenc_h264_tex',

    // recordingDisplay: '',
    recordingWidth: 1280,
    recordingHeight: 720,
    framerate: 60,
    bitrate: 10000,
    autoRecord: false,

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
    format: {
        type: 'string',
        enum: ['mp4', 'mkv']
    },
    encoder: {
        type: 'string',
        enum: ['obs_nvenc_h264_tex', 'obs_nvenc_hevc_tex', 'obs_x264']
    },

    recordingDisplay: {
        type: 'string'
    },
    recordingWidth: {
        type: 'number',
        minimum: 1,
        maximum: 4096
    },
    recordingHeight: {
        type: 'number',
        minimum: 1,
        maximum: 4096
    },
    framerate: {
        type: 'number',
        enum: [10, 20, 24, 30, 48, 60]
    },
    bitrate: {
        type: 'number',
        enum: [3000, 5000, 10000, 15000, 20000, 30000, 50000, 100000]
    },
    
    speaker: {
        type: 'string'
    },
    microphone: {
        type: 'string'
    },
    webcam: {
        type: 'string'
    }, 

    autoRecord: {
        type: 'boolean'
    }
};

let instances, settingsData, pendingRequests;

function initMainVariables() {
    instances = {};
    // attempt to load the settings
    try {
        settingsData = new Store({ defaults: SETTINGS_DATA_DEFAULTS, schema: SETTINGS_DATA_SCHEMA });
    }
    catch (error) {
        // error will occur if the file cannot be read, has corrupted values, or has invalid values (which should only occur if the user manually tampered with it)
        console.log('Error initializing Store: ', error);

        try {
            // delete the corrupted file
            unlinkSync(path.join(app.getPath('userData'), 'config.json'));
            console.log('config.json deleted.');

            // recreate the settings with the default values
            settingsData = new Store({ defaults: SETTINGS_DATA_DEFAULTS, schema: SETTINGS_DATA_SCHEMA });
            console.log('Store reinitialized with default settings.');
        } 
        catch (fsError) {
            console.error('Error deleting or resetting config file:', fsError);
        }
    }
    pendingRequests = new Map();
}