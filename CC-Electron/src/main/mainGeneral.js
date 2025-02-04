/**
 * Module for initializing general components for the main process
 * 
 * @module mainGeneral
 * @requires electron
 * @requires path
 * @requires ps-list
 * @requires mainVariables
 */
import { BrowserWindow, ipcMain } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import psList from 'ps-list';
import { 
    MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, CHECK_PROGRAMS_DELAY_IN_MSECONDS, PAD, LOGS_PATH, LOGS_DIVIDER, THUMBNAIL_SIZE, 
    ACTIVE_DIRECTORY, CAPTURES_DIRECTORY_DEF, CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_DIRECTORY_DEF, CLIPS_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
    CAPTURES_DATE_FORMAT, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    SETTINGS_PATH_DEF, STGS_DATA_SCHEMA, STGS_DATA_DEFAULTS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    data, flags, inst, progs, state, uuid 
} from './mainVariables.js';

/**
 * @exports initMainGeneral, togAutoRec, checkProgs, logProc, atmpAsyncFunc
 */
export { initMainGeneral, togAutoRec, checkProgs, getVideoDate, getLogDate, logProc, atmpAsyncFunc };

/**
 * Initializes general components
 */
function initMainGeneral() {
    initWindow();
    initWindowL();
}

/**
 * Initializes the window
 */
function initWindow() {
    // initialize the browser window
    inst['mainWindow'] = new BrowserWindow({
        minWidth: MAIN_WINDOW_WIDTH_MIN,
        minHeight: MAIN_WINDOW_HEIGHT_MIN,
        show: false,
        icon: path.join(ACTIVE_DIRECTORY, '..', 'assets', 'app-icon', 'capcha-app-icon.png'),
        frame: false,
        webPreferences: {
            preload: path.join(ACTIVE_DIRECTORY, 'preload.js'),
            contextIsolation: true 
        } 
    });

    // start the main window maximized and load the HTML file
    inst['mainWindow'].maximize();
    inst['mainWindow'].loadFile('src/renderer/index.html');
}

/**
 * Initializes the window listeners
 */
function initWindowL() {
    // on minWindow, minimize the main window
    ipcMain.on('window:minWindow', (_) => inst['mainWindow'].minimize());

    // on maxWindow, maximize the main window
    ipcMain.on('window:maxWindow', (_) => inst['mainWindow'].isMaximized() ? inst['mainWindow'].unmaximize() : inst['mainWindow'].maximize());

    // on closeWindow, close the main window
    ipcMain.on('window:closeWindow', (_) => inst['mainWindow'].close());

    // on reqTogAutoRec, call togAutoRec
    ipcMain.on('window:reqTogAutoRec', (_) => {
        togAutoRec();
    }); 
}

/**
 * Toggles the auto recording
 */
function togAutoRec() {
    // if auto recording is on, start checking the programs list periodically; else, cancel the auto recording
    data['stgs'].get('autoRecord') ? state['autoRecIntv'] = setInterval(async () => await checkProgs(), CHECK_PROGRAMS_DELAY_IN_MSECONDS) : clearInterval(state['autoRecIntv']);
}

/**
 * Checks if certain programs are running and toggle auto recording
 */
async function checkProgs() {
    // get the process list
    const procs = await atmpAsyncFunc(() => psList());

    // check if recording is enabled
    if (flags['isRec']) {
        // check if the recording game is not running and stop the recording
        if (state['recGame'] && !procs.some(process => process['name'].toLowerCase() === progs[state['recGame']].toLowerCase())) {
            inst['mainWindow'].webContents.send('webSocket:reqTogRecBarBtn');
        }
    }
    // else, check the program list and enable recording if a match is found
    else {
        for (const [key, value] of Object.entries(progs)) {
            if (procs.some(process => process['name'].toLowerCase() === value.toLowerCase())) {
                state['recGame'] = key;

                inst['mainWindow'].webContents.send('webSocket:reqTogRecBarBtn', state['recGame']);

                break;
            }
        }
    }
}

/**
 * Gets the video date
 * 
 * @returns {string} The video date (MMDDYYhhmmss)
 */
function getVideoDate() {
    const curDate = new Date();

    return `${PAD(curDate.getMonth())}${PAD(curDate.getDate())}${curDate.getFullYear().toString().slice(-2)}${PAD(curDate.getHours())}${PAD(curDate.getMinutes())}${PAD(curDate.getSeconds())}`;
}

/**
 * Gets the log date
 * 
 * @returns {string} The log date (hh:mm:ss)
 */
function getLogDate() {
    const curDate = new Date();

    return `${PAD(curDate.getHours())}:${PAD(curDate.getMinutes())}:${PAD(curDate.getSeconds())}`;
}

/**
 * Logs the initialization process to console or a log file
 * 
 * @param {string} proc - The process being logged
 * @param {string} event - The event being logged
 * @param {string} logMsg - The log message
 * @param {boolean} isFinalMsg - If the log is the final one of its set
 * @param {boolean} isSubMsg - If the log is a sub message with its set
 * @param {boolean} isCons - If the log is sent to console or a log file
 */
async function logProc(proc, event, logMsg, isFinalMsg = true, isSubMsg = false, isCons = true) {
    // get the log entry with the time
    const logEntry = `[${getLogDate()}][${proc}][${event.toUpperCase().padEnd(5, '-')}]: ${isSubMsg ? '  ' : ''}` + `${logMsg}${isFinalMsg ? `\n${LOGS_DIVIDER}` : ''}`;
    
    // if the log is for console, log to console
    if (isCons) {
        console.log(logEntry);
    }
    // otherwise, log to the log file
    else {
        await atmpAsyncFunc(() => fs.appendFile(LOGS_PATH, logEntry + '\n', 'utf-8'));
    }
}

/**
 * Attempts an asynchronous function multiple times with a delay between each
 * 
 * @param {Function} asyncFunc - The asynchronous function
 * @param {number} atmps - The number of attempts
 * @param {number} delay - The delay between attempts in milliseconds
 * @param {boolean} init - If the asynchronous function is run during initialization
 * @returns {Promise} The result of the attempts
 */
async function atmpAsyncFunc(asyncFunc, atmps = ASYNC_ATTEMPTS, delay = ASYNC_DELAY_IN_MSECONDS) {
    // repeat for the number of attempts
    for (let i = 1; i <= atmps; i++) {
        // try the asynchronous function
        try {
            return await asyncFunc();
        } 
        catch (error) {
            // do another attempt after the delay
            if (i < atmps) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            else {
                logProc('WebSocket', 'GEN', error);
                // throw new Error(`Function failed after ${atmps} atmps: `, error);
                // error code...
            }
        }
    }
}