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
import { initWebSocket, initWebSocketL } from './webSocketEJS.js';
import { initSettings, initSettingsL } from './settingsEJS.js';

export { initOBS };

function initOBS() {
    // start OBS
    components['obsProcess'] = spawn(OBS_EXECUTABLE_PATH, [
        '--portable',
        '--multi',
        '--minimize-to-tray'
    ], {
        cwd: path.dirname(OBS_EXECUTABLE_PATH),
    });
}