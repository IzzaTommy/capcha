// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import psList from 'ps-list';

import { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, instances, initMainVariables, SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, GAMES, flags, data, state } from './mainVariables.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, webSocketSend } from './mainWebSocket.js';
import { initMainSettings } from './mainSettings.js';
import { attemptAsyncFunction } from './mainSharedFunctions.js';

export { initMainWindow };

function initMainWindow() {
    initWindow();
    initWindowL();
}

function initWindow() {
    // start the window
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

    // start index.html maximized
    instances['mainWindow'].maximize();

    instances['mainWindow'].loadFile('src/renderer/index.html');
}

function initWindowL() {
    // on close, grab the video volume setting
    instances['mainWindow'].on('close', (event) => {
        event.preventDefault();

        instances['mainWindow'].webContents.send('settings:reqVolumeSettings');
    });

    // minimizes the window
    ipcMain.on('window:minimize', (_) => instances['mainWindow'].minimize());

    // maximizes or unmaximizes the window
    ipcMain.on('window:maximize', (_) => {
        if (instances['mainWindow'].isMaximized()) {
            instances['mainWindow'].unmaximize();
        }
        else {
            instances['mainWindow'].maximize();
        }
    });

    // closes the window and triggers event
    ipcMain.on('window:close', (_) => instances['mainWindow'].close());

    ipcMain.on('window:readyCheck', (_) => {
        initAutoRecord();
    });


    async function checkProgramList() {
        const processes = await attemptAsyncFunction(() => psList(), 3, 2000);

        // if not recording
        if (!flags['recording']) {
            console.log('not recording');
            for (const [key, value] of Object.entries(GAMES)) {
                // if (processes.includes(value)) {
                if (processes.some(process => process.name.toLowerCase() === value.toLowerCase())) {
                    instances['mainWindow'].webContents.send('websocket:reqSetActiveRecordBtn');
                    state['recordingGame'] = key;
                    break;
                }
            }
        }
        // if recording
        else {
            console.log('recording');
            // if the recording game is not in the processes
            if (state['recordingGame'] && !processes.some(process => process.name.toLowerCase() === GAMES[state['recordingGame']].toLowerCase())) {
                instances['mainWindow'].webContents.send('websocket:reqSetActiveRecordBtn');
                state['recordingGame'] = null;  // not needed
            }
        }
    }
    
    
    function initAutoRecord() {
        setInterval(() => checkProgramList(), 5000);
    }
}