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
    ACTIVE_DIRECTORY, DEF_CAPTURES_DIRECTORY, DEF_CLIPS_DIRECTORY, CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, 
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