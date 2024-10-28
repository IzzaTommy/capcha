// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';

import { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, instances, pendingRequests, initMainVariables, SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, settingsData } from './mainVariables.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, initMainWebSocketL } from './mainWebSocket.js';
import { initMainSettings, initMainSettingsL } from './mainSettings.js';

export { initMainWindow, initMainWindowL };

function initMainWindow() {
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

    instances['mainWindow'].webContents.openDevTools();
}

function initMainWindowL() {
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
}