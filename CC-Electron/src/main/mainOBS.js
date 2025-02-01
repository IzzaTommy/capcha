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