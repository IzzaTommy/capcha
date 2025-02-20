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
import { app, powerMonitor } from 'electron';
import { 
    TERMINATION_SIGNAL, ACTIVE_DIRECTORY, MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, MAIN_WINDOW_ICON_PATH, PRELOAD_PATH, INDEX_PATH, 
    CLIP_FRAMERATE, CLIP_VIDEO_BITRATE, CLIP_AUDIO_CODEC, CLIP_AUDIO_BITRATE, CLIP_AUDIO_CHANNELS, CLIP_THREADS, CLIP_VIDEO_CODEC, 
    CHECK_PROGRAMS_DELAY, TIME_PAD, EVENT_PAD, LOGS_PATH, LOGS_DIV, 
    OBS_EXECUTABLE_PATH, CAPTURES_DATE_FORMAT, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, THUMBNAIL_SIZE, 
    SETTINGS_CONFIG_PATH, SETTINGS_DATA_SCHEMA, SETTINGS_DATA_DEFS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    data, flags, insts, states, uuids 
} from './mainVariables.js';
import { initMainGen, logProc } from './mainGeneral.js';
import { initMainOBS } from './mainOBS.js';
import { initMainWebSocket } from './mainWebSocket.js';
import { initMainStgs } from './mainSettings.js';

// on ready, initialize all components
app.on('ready', initMain);

// THIS DOES NOT WORK, SLEEP NEEDS TO BE ALLOWED ON THE OBS SIDE
// on suspend, log and stop recording if it is enabled
powerMonitor.on('suspend', () => {
    logProc('General', 'SUSPD', 'Suspension detected', false);  // boolean1 isFinalMsg

    // check if recording is enabled
    if (flags['isRec']) {
        // log the recording status and attempt to stop
        logProc('General', 'SUSPD', 'Recording active', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        logProc('General', 'SUSPD', 'Attempting to stop recording', true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        insts['mainWindow']['webContents'].send('stgs:reqTogRecBarBtn');
    }
    else {
        logProc('General', 'SUSPD', 'Recording not active', true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    }
});

// typical execution: before-quit -> close all windows -> window-all-closed -> will-quit -> quit
// close button clicked: close all windows -> window-all-closed -> before-quit -> will-quit -> quit

// on window-all-closed, log and initiate the app quitting process
app.on('window-all-closed', () => {
    logProc('General', 'CLOSE', 'All windows closed');

    app.quit();
})

// on before-quit, log and kill the OBS process
app.on('before-quit', () => { 
    logProc('General', 'CLOSE', 'Terminating the OBS Process', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

    if (insts['obsProcess'] && !insts['obsProcess'].killed) {
        insts['obsProcess'].kill('SIGTERM');
    }

    logProc('General', 'CLOSE', `${insts['obsProcess'].killed ? 'Successfully terminated' : 'Failed to terminate'}` + 'the OBS Process', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
});

// on will-quit, log that CapCha is quitting
app.on('will-quit', () => {
    logProc('General', 'CLOSE', 'Quitting Capcha', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
});

// on quit, log that CapCha has successfully quit
app.on('quit', () => {
    logProc('General', 'CLOSE', 'Successfully quit CapCha', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
});

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