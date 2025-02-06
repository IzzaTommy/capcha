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
    ACTIVE_DIRECTORY, MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, MAIN_WINDOW_ICON_PATH, PRELOAD_PATH, INDEX_PATH, 
    CHECK_PROGRAMS_DELAY_IN_MSECONDS, TIME_PAD, EVENT_PAD, LOGS_PATH, LOGS_DIV, 
    OBS_EXECUTABLE_PATH, CAPTURES_DATE_FORMAT, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, THUMBNAIL_SIZE, 
    SETTINGS_CONFIG_PATH, SETTINGS_DATA_SCHEMA, SETTINGS_DATA_DEFS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    data, flags, insts, progs, states, uuids 
} from './mainVariables.js';
import { initMainGen, logProc } from './mainGeneral.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket } from './mainWebSocket.js';
import { initMainStgs } from './mainSettings.js';

// on ready, initialize all components
app.on('ready', initMain);

// on before quit, kill the OBS process
app.on('before-quit', () => insts['obsProcess'].kill('SIGTERM'));

/**
 * Initializes the main process
 */
function initMain() {
    init();

    // on did finish load, finish initialization
    insts['mainWindow']['webContents'].on('did-finish-load', finishInit);
}

/**
 * Initializes the variables and general components
 */
function init() {
    initMainGen();
}

/**
 * Initializes OBS, WebSocket, and the settings
 */
async function finishInit() {
    initMainOBS();
    await initMainWebSocket();
    await initMainStgs();

    // finish initializing the renderer process
    insts['mainWindow']['webContents'].openDevTools();
    insts['mainWindow']['webContents'].send('proc:reqFinishInit');
}