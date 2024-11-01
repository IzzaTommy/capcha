// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';

import { exec } from 'child_process';
import psList from 'ps-list';

import { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, instances, initMainVariables, SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, GAMES, flags, data, state } from './mainVariables.js';
import { initMainWindow } from './mainWindow.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, webSocketSend } from './mainWebSocket.js';
import { initMainSettings } from './mainSettings.js';

export { attemptAsyncFunction };

async function attemptAsyncFunction(asyncFunction, attempts, delay) {
    for (let i = 0; i < attempts; i++) {
        try {
            return await asyncFunction();
        } 
        catch (error) {
            console.error(`Attempt ${i} failed: `, error);

            if (i < attempts - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(`Function failed after ${attempts} attempts: `, error);
            }
        }
    }
}