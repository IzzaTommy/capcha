// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';

import { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, instances, pendingRequests, initMainVariables, SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, settingsData } from './mainVariables.js';
import { initMainWindow, initMainWindowL } from './mainWindow.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, initMainWebSocketL } from './mainWebSocket.js';
import { initMainSettings, initMainSettingsL } from './mainSettings.js';

// loads the app when ready
app.on('ready', () => {
    // initialize variables
    initMainVariables();

    // initialize the main window and listeners
    initMainWindow();
    initMainWindowL();

    // wait for main window to finish loading, then initialize OBS and websocket
    instances['mainWindow'].webContents.on('did-finish-load', async () => {
        initMainOBS();

        try {
            await initMainWebSocket();
            initMainWebSocketL();
            initMainSettings();
            initMainSettingsL();

            instances['mainWindow'].webContents.send('window:reqFinishInitRend');
        }
        catch (error) {
            console.log('couldnt connect');
        }
    });
});

app.on('before-quit', () => {
    instances['obsProcess'].kill('SIGTERM');
});