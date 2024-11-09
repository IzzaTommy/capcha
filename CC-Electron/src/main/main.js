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

import { instances, initMainVariables } from './mainVariables.js';
import { initMainWindow } from './mainWindow.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, webSocketSend } from './mainWebSocket.js';
import { initMainSettings } from './mainSettings.js';
import { attemptAsyncFunction } from './mainSharedFunctions.js';

app.on('ready', initMain);

app.on('before-quit', () => instances['obsProcess'].kill('SIGTERM'));

function initMain() {
    init();

    instances['mainWindow'].webContents.on('did-finish-load', finishInit);
}

function init() {
    initMainVariables();
    initMainWindow();
}

async function finishInit() {
    initMainOBS();
    await initMainWebSocket();
    await initMainSettings();

    instances['mainWindow'].webContents.openDevTools();
    instances['mainWindow'].webContents.send('window:reqFinishInit');
}