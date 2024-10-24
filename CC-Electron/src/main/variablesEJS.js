import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import EventEmitter from 'events';

import { initMainWindow, initMainWindowL } from './mainWindowEJS.js';
import { initOBS } from './obsEJS.js';
import { initWebSocket, initWebSocketL } from './webSocketEJS.js';
import { initSettings, initSettingsL } from './settingsEJS.js';

export { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, GLOBAL_EMITTER, components, initVariables };

// constants
const THUMBNAIL_SIZE = '320x180';
const ACTIVE_DIRECTORY = import.meta.dirname;
const DEF_VIDEO_DIRECTORY = path.join(app.getPath('videos'), 'CapCha');
const DEF_THUMBNAIL_DIRECTORY = path.join(app.getPath('userData'), 'thumbnails');
const OBS_EXECUTABLE_PATH = path.join(ACTIVE_DIRECTORY, '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'bin', '64bit', 'obs64.exe');
const GLOBAL_EMITTER = new EventEmitter();

let components;

function initVariables() {
    components = {};
}