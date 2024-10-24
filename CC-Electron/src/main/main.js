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
import { initMainWindow, initMainWindowL } from './mainWindowEJS.js';
import { initOBS } from './obsEJS.js';
import { initWebSocket, initWebSocketL } from './webSocketEJS.js';
import { initSettings, initSettingsL } from './settingsEJS.js';

// loads the app when ready
app.on('ready', () => {
    initVariables();

    initMainWindow();
    initMainWindowL();

    initOBS();
    initWebSocket();

    GLOBAL_EMITTER.on('webSocketOpen', () => {
        initWebSocketL();
    });

    GLOBAL_EMITTER.on('webSocketLOpen', () => {
        initSettings();
        initSettingsL();
        components['mainWindow'].webContents.send('window:reqFinishInit');
    })
});

app.on('before-quit', () => {
    components['obsProcess'].kill('SIGTERM');
});