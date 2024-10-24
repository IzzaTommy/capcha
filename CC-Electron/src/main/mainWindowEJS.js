// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import EventEmitter from 'events';

import { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, GLOBAL_EMITTER, components, initVariables } from './variablesEJS.js';
import { initOBS } from './obsEJS.js';
import { initWebSocket, initWebSocketL } from './webSocketEJS.js';
import { initSettings, initSettingsL } from './settingsEJS.js';

export { initMainWindow, initMainWindowL };

function initMainWindow() {
    // start the window
    components['mainWindow'] = new BrowserWindow({
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
    components['mainWindow'].maximize();
    components['mainWindow'].loadFile('src/renderer/index.html');

    components['mainWindow'].webContents.openDevTools();
}

function initMainWindowL() {
    // on close, grab the video volume setting
    components['mainWindow'].on('close', (event) => {
        event.preventDefault();

        components['mainWindow'].webContents.send('settings:reqVolumeSettings');
    });

    // minimizes the window
    ipcMain.on('window:minimize', (_) => components['mainWindow'].minimize());
    // maximizes or unmaximizes the window
    ipcMain.on('window:maximize', (_) => {
        if (components['mainWindow'].isMaximized()) {
            components['mainWindow'].unmaximize();
        }
        else {
            components['mainWindow'].maximize();
        }
    });
    // closes the window and triggers event
    ipcMain.on('window:close', (_) => components['mainWindow'].close());
}