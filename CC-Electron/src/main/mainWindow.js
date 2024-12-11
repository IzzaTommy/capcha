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
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, webSocketSend } from './mainWebSocket.js';
import { initMainSettings } from './mainSettings.js';
import { attemptAsyncFunction } from './mainSharedFunctions.js';

export { initMainWindow, toggleAutoRecord };

/**
 * Initializes the window
 */
function initMainWindow() {
    initWindow();
    initWindowL();
}

/**
 * Initializes the window
 */
function initWindow() {
    instances['mainWindow'] = new BrowserWindow({
        minWidth: 1280,
        minHeight: 900,
        show: false,
        icon: path.join(ACTIVE_DIRECTORY, '..', 'assets', 'app-icon', 'capcha-app-icon.png'),
        frame: false,
        webPreferences: {
            preload: path.join(ACTIVE_DIRECTORY, 'preload.js'),
            contextIsolation: true,
        }
    });

    // start the main window maximized
    instances['mainWindow'].maximize();
    instances['mainWindow'].loadFile('src/renderer/index.html');
}

/**
 * Initializes the window listeners
 */
function initWindowL() {
    // on minimizeWindow, minimize the main window
    ipcMain.on('window:minimizeWindow', (_) => instances['mainWindow'].minimize());

    // on maximizeWindow, maximize the main window
    ipcMain.on('window:maximizeWindow', (_) => {
        if (instances['mainWindow'].isMaximized()) {
            instances['mainWindow'].unmaximize();
        }
        else {
            instances['mainWindow'].maximize();
        }
    });

    // on closeWindow, close the main window
    ipcMain.on('window:closeWindow', (_) => instances['mainWindow'].close());

    // on reqToggleAutoRecord, run toggleAutoRecord
    ipcMain.on('window:reqToggleAutoRecord', (_) => {
        toggleAutoRecord();
    }); 
}

/**
 * Toggles the auto recording
 */
function toggleAutoRecord() {
    // if auto record is on, start checking the programs list every 3 seconds
    if (data['settings'].get('autoRecord')) {
        state['autoRecordInterval'] = setInterval(async () => await checkPrograms(), 5000);
    }
    // else cancel the auto recording
    else {
        clearInterval(state['autoRecordInterval']);
        state['autoRecordInterval'] = null;
    }
}

/**
 * Checks if certain programs are running and toggle auto recording
 */
async function checkPrograms() {
    // get the process list
    const processes = await attemptAsyncFunction(() => psList(), ATTEMPTS, FAST_DELAY_IN_MSECONDS);

    // if recording is on, check if the recording game is not running and stop the recording
    if (flags['recording']) {
        if (state['recordingGame'] && !processes.some(process => process['name'].toLowerCase() === PROGRAMS[state['recordingGame']].toLowerCase())) {
            instances['mainWindow'].webContents.send('webSocket:reqToggleRecordBtn');
        }
    }
    // else check the program list and toggle recording if a match is found
    else {
        for (const [key, value] of Object.entries(PROGRAMS)) {
            if (processes.some(process => process['name'].toLowerCase() === value.toLowerCase())) {
                state['recordingGame'] = key;

                instances['mainWindow'].webContents.send('webSocket:reqToggleRecordBtn', state['recordingGame']);
                break;
            }
        }
    }
}