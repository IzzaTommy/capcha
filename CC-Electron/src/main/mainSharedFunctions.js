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
    ACTIVE_DIR, DEF_CAPS_DIR, DEF_CLIPS_DIR, CAPS_THUMBNAIL_DIR, CLIPS_THUMBNAIL_DIR, OBS_EXECUTABLE_PATH, 
    SCENE_NAME, SPKR_INPUT_NAME, MIC_INPUT_NAME, 
    STGS_DATA_DEFAULTS, STGS_DATA_SCHEMA, 
    PROGRAMS, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, 
    instances, flags, 
    data, state, uuid, 
    initMainVariables 
} from './mainVariables.js';
import { initMainWindow } from './mainWindow.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket, webSocketSend } from './mainWebSocket.js';
import { initMainSettings } from './mainSettings.js';

export { attemptAsyncFunction };

/**
 * 
 * @param {*} asyncFunction 
 * @param {*} attempts 
 * @param {*} delay 
 * @returns 
 */
async function attemptAsyncFunction(asyncFunction, attempts, delay) {
    // iterate through each attempt
    for (let i = 1; i <= attempts; i++) {
        // try the asynchronous function
        try {
            return await asyncFunction();
        } 
        catch (error) {
            console.error(`Attempt ${i} failed: `, error);

            // do another attempt after the delay
            if (i < attempts) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            // throw an error if there are no more attempts
            else {
                throw new Error(`Function failed after ${attempts} attempts: `, error);
            }
        }
    }
}