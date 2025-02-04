/**
 * Module for initializing all components for the main process
 * 
 * @module main
 * @requires electron
 * @requires mainVariables
 * @requires mainGeneral
 * @requires mainOBS
 * @requires mainWebSocket
 * @requires mainSettings
 */
import { app } from 'electron';
import { 
    MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, CHECK_PROGRAMS_DELAY_IN_MSECONDS, PAD, LOGS_PATH, LOGS_DIVIDER, THUMBNAIL_SIZE, 
    ACTIVE_DIRECTORY, CAPTURES_DIRECTORY_DEF, CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_DIRECTORY_DEF, CLIPS_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
    CAPTURES_DATE_FORMAT, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    SETTINGS_PATH_DEF, STGS_DATA_SCHEMA, STGS_DATA_DEFAULTS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    data, flags, inst, progs, state, uuid 
} from './mainVariables.js';
import { initMainGeneral, logProc } from './mainGeneral.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket } from './mainWebSocket.js';
import { initMainSettings } from './mainSettings.js';

// on ready, initialize all components
app.on('ready', initMain);

// on before quit, kill the OBS process
app.on('before-quit', () => inst['obsProcess'].kill('SIGTERM'));

/**
 * Initializes the main process
 */
function initMain() {
    init();

    // on did finish load, finish initialization
    inst['mainWindow'].webContents.on('did-finish-load', finishInit);
}

/**
 * Initializes the variables and general components
 */
function init() {
    initMainGeneral();
}

/**
 * Initializes OBS, WebSocket, and the settings
 */
async function finishInit() {
    initMainOBS();
    await initMainWebSocket();
    await initMainSettings();

    // finish initializing the renderer process
    inst['mainWindow'].webContents.openDevTools();
    inst['mainWindow'].webContents.send('process:reqFinishInit');
}