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
    ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
    SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, 
    PROGRAMS, 
    instances, flags, 
    data, state, 
    initMainVariables 
} from './mainVariables.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, webSocketSend } from './mainWebSocket.js';
import { initMainSettings } from './mainSettings.js';
import { attemptAsyncFunction } from './mainSharedFunctions.js';

export { initMainWindow, toggleAutoRecord };

function initMainWindow() {
    initWindow();
    initWindowL();
}

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

    instances['mainWindow'].maximize();

    instances['mainWindow'].loadFile('src/renderer/index.html');
}

function initWindowL() {
    instances['mainWindow'].on('close', (event) => {
        event.preventDefault();

        instances['mainWindow'].webContents.send('settings:reqVolumeSettings');
    });

    ipcMain.on('window:minimizeWindow', (_) => instances['mainWindow'].minimize());

    ipcMain.on('window:maximizeWindow', (_) => {
        if (instances['mainWindow'].isMaximized()) {
            instances['mainWindow'].unmaximize();
        }
        else {
            instances['mainWindow'].maximize();
        }
    });

    ipcMain.on('window:closeWindow', (_) => instances['mainWindow'].close());

    ipcMain.on('window:reqToggleAutoRecord', (_) => {
        toggleAutoRecord();
    }); 
}

function toggleAutoRecord() {
    if (data['settings'].get('autoRecord')) {
        state['autoRecordInterval'] = setInterval(async () => await checkPrograms(), 5000);
    }
    else {
        clearInterval(state['autoRecordInterval']);
        state['autoRecordInterval'] = null;
    }
}

async function checkPrograms() {
    const processes = await attemptAsyncFunction(() => psList(), 3, 2000);

    console.log('\n---------------- RECORDING ----------------');
        
    console.log('Recording Game: ', state['recordingGame']);

    if (flags['recording']) {
        console.log('Recording Status: Recording');
        if (state['recordingGame'] && !processes.some(process => process['name'].toLowerCase() === PROGRAMS[state['recordingGame']].toLowerCase())) {
            instances['mainWindow'].webContents.send('webSocket:reqToggleRecordBtn');
        }
    }
    else {
        console.log('Recording Status: Not Recording');
        for (const [key, value] of Object.entries(PROGRAMS)) {
            if (processes.some(process => process['name'].toLowerCase() === value.toLowerCase())) {
                state['recordingGame'] = key;
                instances['mainWindow'].webContents.send('webSocket:reqToggleRecordBtn', state['recordingGame']);
                break;
            }
        }
    }
}