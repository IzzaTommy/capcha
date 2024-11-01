// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import psList from 'ps-list';

import { instances, initMainVariables } from './mainVariables.js';
import { initMainWindow } from './mainWindow.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, webSocketSend } from './mainWebSocket.js';
import { initMainSettings } from './mainSettings.js';
import { attemptAsyncFunction } from './mainSharedFunctions.js';

// loads the app when ready
app.on('ready', () => {
    // initialize variables
    initMainVariables();

    // initialize the main window and listeners
    initMainWindow();

    // wait for main window to finish loading, then initialize OBS and websocket
    instances['mainWindow'].webContents.on('did-finish-load', async () => {
        initMainOBS();

        await initMainWebSocket();

        await initMainSettings();

        instances['mainWindow'].webContents.openDevTools();
        instances['mainWindow'].webContents.send('window:reqFinishInit');
    });
});

app.on('before-quit', () => {
    instances['obsProcess'].kill('SIGTERM');
});