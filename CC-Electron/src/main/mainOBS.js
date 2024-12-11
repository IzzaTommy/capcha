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

import { 
    THUMBNAIL_SIZE, 
    ACTIVE_DIRECTORY, DEF_CAPTURES_DIRECTORY, DEF_CLIPS_DIRECTORY, CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
    SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, 
    PROGRAMS, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, 
    instances, flags, 
    data, state, 
    initMainVariables 
} from './mainVariables.js';
import { initMainWindow } from './mainWindow.js';
import { initMainWebSocket } from './mainWebSocket.js';
import { initMainSettings } from './mainSettings.js';
import { attemptAsyncFunction } from './mainSharedFunctions.js';

export { initMainOBS };

/**
 * Initializes OBS
 */
function initMainOBS() {
    initOBSProcess();
}

/**
 * Initializes the OBS process
 */
function initOBSProcess() {
    instances['obsProcess'] = spawn(OBS_EXECUTABLE_PATH, [
        '--portable',
        '--multi',
        '--minimize-to-tray'
    ], {
        cwd: path.dirname(OBS_EXECUTABLE_PATH),
    });
}