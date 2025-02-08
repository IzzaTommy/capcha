/**
 * Module for initializing general components for the main process
 * 
 * @module mainGeneral
 * @requires electron
 * @requires path
 * @requires fluent-ffmpeg
 * @requires mainVariables
 */
import { BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
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

/**
 * @exports initMainGen, getVideoDate, getLogDate, logProc, atmpAsyncFunc
 */
export { initMainGen, getVideoDate, getLogDate, logProc, atmpAsyncFunc };

/**
 * Initializes general components
 */
function initMainGen() {
    initWindow();

    initGenL();
}

/**
 * Initializes the window
 */
function initWindow() {
    // initialize the browser window
    insts['mainWindow'] = new BrowserWindow({
        minWidth: MAIN_WINDOW_WIDTH_MIN,
        minHeight: MAIN_WINDOW_HEIGHT_MIN,
        show: false,
        icon: MAIN_WINDOW_ICON_PATH,
        frame: false,
        webPreferences: {
            preload: PRELOAD_PATH,
            contextIsolation: true 
        } 
    });

    // start the main window maximized and load the HTML file
    insts['mainWindow'].maximize();
    insts['mainWindow'].loadFile(INDEX_PATH);
}

/**
 * Initializes the general listeners
 */
function initGenL() {
    // on minWindow, minimize the main window
    ipcMain.on('gen:minWindow', (_) => insts['mainWindow'].minimize());

    // on maxWindow, maximize the main window
    ipcMain.on('gen:maxWindow', (_) => insts['mainWindow'].isMaximized() ? insts['mainWindow'].unmaximize() : insts['mainWindow'].maximize());

    // on closeWindow, close the main window
    ipcMain.on('gen:closeWindow', (_) => insts['mainWindow'].close());

    // on createClip, create a clip of the video with the given start and end times
    ipcMain.handle('gen:createClip', async (_, videoDataPath, clipStartTime, clipEndTime) => {
        try {
            const result = await new Promise((resolve, reject) => {
                const cmd = ffmpeg(videoDataPath);
    
                cmd.setStartTime(clipStartTime);
                cmd.duration(clipEndTime - clipStartTime);
                // cmd.videoFilters(`scale=${data['stgs'].get('clipsWidth')}:${data['stgs'].get('clipsHeight')}`);

                // cmd.inputOptions('-hwaccel cuda');
                cmd.videoCodec('h264_nvenc');
                cmd.audioCodec('aac');

                // cmd.outputOptions('-threads 1');
                cmd.outputOptions('-preset veryfast');
                cmd.outputOptions('-c copy');
                cmd.output(path.join(data['stgs'].get('clipsDirectory'), `Clip-${getVideoDate()}.${data['stgs'].get('clipsFormat')}`));
    
                cmd.on('end', () => {
                    resolve();
                });
                cmd.on('error', reject);
                cmd.run();
            });
    
            console.log('Processed video saved to:', result);
            
        } 
        catch (error) {
            console.error('Processing failed:', error);
        }

        console.log('done?');
    });
}

/**
 * Gets the video date
 * 
 * @returns {string} The video date (MMDDYYhhmmss)
 */
function getVideoDate() {
    const curDate = new Date();

    return `${TIME_PAD(curDate.getMonth())}${TIME_PAD(curDate.getDate())}${curDate.getFullYear().toString().slice(-2)}${TIME_PAD(curDate.getHours())}${TIME_PAD(curDate.getMinutes())}${TIME_PAD(curDate.getSeconds())}`;
}

/**
 * Gets the log date
 * 
 * @returns {string} The log date (hh:mm:ss)
 */
function getLogDate() {
    const curDate = new Date();

    return `${TIME_PAD(curDate.getHours())}:${TIME_PAD(curDate.getMinutes())}:${TIME_PAD(curDate.getSeconds())}`;
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
    const logEntry = `[${getLogDate()}][${proc}][${EVENT_PAD(event.toUpperCase())}]: ${isSubMsg ? '  ' : ''}` + `${logMsg}${isFinalMsg ? `\n${LOGS_DIV}` : ''}`;
    
    // if the log is for console, log to console
    if (isCons)
        console.log(logEntry);
    // otherwise, log to the log file
    else
        await atmpAsyncFunc(() => fs.appendFile(LOGS_PATH, logEntry + '\n'));
}

/**
 * Attempts an asynchronous function multiple times with a delay between each
 * 
 * @param {Function} asyncFunc - The asynchronous function
 * @param {number} atmps - The number of attempts
 * @param {number} delay - The delay between attempts in milliseconds
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
            if (i < atmps)
                await new Promise(resolve => setTimeout(resolve, delay));
            else
                logProc('WebSocket', 'GEN', error);
                // throw new Error(`Function failed after ${atmps} atmps: `, error);
                // error code...
        }
    }
}