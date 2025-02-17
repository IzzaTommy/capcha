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

/**
 * @exports initMainGen, createClip, getVideoDate, getLogDate, logProc, atmpAsyncFunc
 */
export { initMainGen, createClip, getVideoDate, getLogDate, logProc, atmpAsyncFunc };

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
            contextIsolation: true, 
            backgroundThrottling: false 
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
    ipcMain.handle('gen:reqCreateClip', async (_, videoDataPath, clipStartTime, clipEndTime) => await atmpAsyncFunc(() => createClip(videoDataPath, clipStartTime, clipEndTime)));
}

/**
 * Creates a clip from a video
 * 
 * @param {string} videoDataPath - The path of the video
 * @param {number} clipStartTime - The clip start time
 * @param {number} clipEndTime - The clip end time
 * @returns {Promise} - The result of creating a clip
 */
function createClip(videoDataPath, clipStartTime, clipEndTime) {
    // log that the clip is being created
    logProc('General', 'CLIP', 'Creating clip...', false);  // boolean1 isFinalMsg

    return new Promise((resolve, reject) => {
        const cmd = ffmpeg(videoDataPath);
        const name = `Clip-${getVideoDate()}.${data['stgs'].get('clipsFormat')}`;

        // on end, log the success and resolve the promise
        cmd.on('end', () => {
            logProc('General', 'REQ', 'Successfully created clip', true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            resolve();
        });

        // on error, log the error and reject the promise
        cmd.on('error', (error) => {
            logProc('General', 'ERROR', 'Couldn\'t create clip', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            logProc('General', 'ERROR', `Error message: ${error}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            reject(error);
        });

        // set the video parameters, optimizing for file size
        cmd.setStartTime(clipStartTime);
        cmd.setDuration(clipEndTime - clipStartTime);
        cmd.size(`${data['stgs'].get('clipsWidth')}x${data['stgs'].get('clipsHeight')}`);
        cmd.fps(CLIP_FRAMERATE);
        cmd.videoBitrate(CLIP_VIDEO_BITRATE);
        cmd.audioCodec(CLIP_AUDIO_CODEC);
        cmd.audioBitrate(CLIP_AUDIO_BITRATE);
        cmd.audioChannels(CLIP_AUDIO_CHANNELS);
        cmd.inputOptions(CLIP_THREADS);
        cmd.videoCodec(CLIP_VIDEO_CODEC);

        // set the output file name
        cmd.output(path.join(data['stgs'].get('clipsDirectory'), name));

        // run the command
        cmd.run();
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
    if (isCons) {
        console.log(logEntry);
    }
    // otherwise, log to the log file
    else {
        await atmpAsyncFunc(() => fs.appendFile(LOGS_PATH, logEntry + '\n'));
    }
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