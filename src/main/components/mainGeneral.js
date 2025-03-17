/**
 * Module for initializing general components for the main process
 * 
 * @module mainGeneral
 * @requires electron
 * @requires path
 * @requires fluent-ffmpeg
 * @requires fs
 * @requires mainSettings
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { getStg } from './mainSettings.js';

// general constants
// active directory, initialization date
const ACTIVE_DIRECTORY = import.meta.dirname;
const INITIALIZATION_DATE = new Date();

// minimum window size, paths
const MAIN_WINDOW_WIDTH_MIN = 1280;
const MAIN_WINDOW_HEIGHT_MIN = 900;
const MAIN_WINDOW_ICON_PATH = path.join(ACTIVE_DIRECTORY, '..', '..', 'assets', 'app-icon', 'capcha-app-icon.png');
const PRELOAD_PATH = path.join(ACTIVE_DIRECTORY, '..', 'preload.js');
const INDEX_PATH = 'src/renderer/index.html';

// clip parameters
const CLIP_FRAMERATE = 30;
const CLIP_VIDEO_BITRATE = '4000k';
const CLIP_AUDIO_CODEC = 'aac';
const CLIP_AUDIO_BITRATE = '96k';
const CLIP_AUDIO_CHANNELS = 1;
const CLIP_THREADS = '-threads 2';
const CLIP_VIDEO_CODEC = 'h264_nvenc';

// padding functions, logs limit, path, and divider, and byte sizing
const TIME_PAD = (time) => time.toString().padStart(2, '0');
const EVENT_PAD = (event) => event.toString().padEnd(5, '-');
const LOGS_LIMIT = 1;
const LOGS_DIRECTORY = app.getPath('logs');
const LOGS_PATH = path.join(LOGS_DIRECTORY, `${INITIALIZATION_DATE.getFullYear()}-${TIME_PAD(INITIALIZATION_DATE.getMonth() + 1)}-${TIME_PAD(INITIALIZATION_DATE.getDate())}_${TIME_PAD(INITIALIZATION_DATE.getHours())}-${TIME_PAD(INITIALIZATION_DATE.getMinutes())}-${TIME_PAD(INITIALIZATION_DATE.getSeconds())}.txt`);
const LOGS_DIV = '------------------------------------------------------------';
const BYTES_IN_GIGABYTE = 1073741824;

// asynchronous function attempts and delays
export const ASYNC_ATTEMPTS = 3;
export const ASYNC_DELAY_IN_MSECONDS = 3000;
const CLOSE_DELAY = 5000;

// general variables
let mainWindow;

/**
 * Initializes the general variables
 */
export function initMainGenVars() {
    // main window
    mainWindow = null;
}

/**
 * Initializes the general components
 */
export function initMainGen(finishInit) {
    // initialize the main window
    initWindow();

    // initialize the general listeners
    initGenL();

    // on did-finish-load, finish initialization
    mainWindow['webContents'].on('did-finish-load', finishInit);
}

/**
 * Initializes the window
 */
function initWindow() {
    // initialize the browser window
    mainWindow = new BrowserWindow({ 
        minWidth: MAIN_WINDOW_WIDTH_MIN,
        minHeight: MAIN_WINDOW_HEIGHT_MIN,
        show: false,  // hide the window at start
        icon: MAIN_WINDOW_ICON_PATH,
        frame: false,  // hide the native OS window frame
        webPreferences: { 
            preload: PRELOAD_PATH,
            contextIsolation: true,  // run APIs in separate JS context
            backgroundThrottling: false  // no throttling on animations and timers in background
        } 
    });

    // start the main window maximized and load the HTML file
    mainWindow.maximize();
    mainWindow.loadFile(INDEX_PATH);
}

/**
 * Initializes the general listeners
 */
function initGenL() {
    // on minWindow, minimize the main window
    ipcMain.on('gen:minWindow', (_) => mainWindow.minimize());

    // on maxWindow, maximize or unmaximize the main window and return the state
    ipcMain.on('gen:maxWindow', (_) => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());

    // on closeWindow, close the main window
    ipcMain.on('gen:closeWindow', (_) => mainWindow.close());

    // on createClip, create a clip of the video with the given clip start and end times
    ipcMain.handle('gen:reqCreateClip', async (_, videoPath, clipStartTime, clipEndTime) => await atmpAsyncFunc(() => createClip(videoPath, clipStartTime, clipEndTime), 1));

    // on maximize, set the maximize bar icon
    mainWindow.on('maximize', () => mainWindow['webContents'].send('gen:reqSetMaxBarIcon', true));

    // on unmaximize, set the maximize bar icon
    mainWindow.on('unmaximize', () => mainWindow['webContents'].send('gen:reqSetMaxBarIcon', false));

    // on minimize, set the maximize bar icon
    mainWindow.on('minimize', () => mainWindow['webContents'].send('gen:reqSetMaxBarIcon', false));
}

/**
 * Gets the readable video date
 * 
 * @returns {string} The readable video date (MMDDYYhhmmss)
 */
function getRdblVideoDate() {
    // get the current date
    const curDate = new Date();

    // return the formatted video date
    return `${TIME_PAD(curDate.getMonth())}${TIME_PAD(curDate.getDate())}${curDate.getFullYear().toString().slice(-2)}${TIME_PAD(curDate.getHours())}${TIME_PAD(curDate.getMinutes())}${TIME_PAD(curDate.getSeconds())}`;
}

/**
 * Creates a clip from a video
 * 
 * @param {string} videoPath - The path of the video
 * @param {number} clipStartTime - The clip start time
 * @param {number} clipEndTime - The clip end time
 * @returns {Promise} - The result of creating a clip
 */
function createClip(videoPath, clipStartTime, clipEndTime) {
    // throw new Error('test error');
    // log that the clip is being created
    addLogMsg('General', 'CLIP', 'Creating clip...', false);  // boolean1 isFinalMsg

    // return a promise to create the clip
    return new Promise((resolve, reject) => {
        // get the ffmpeg command and clip name
        const cmd = ffmpeg(videoPath);
        const clipName = `Clip-CC${getRdblVideoDate()}.${getStg('clipsFormat')}`;

        // on end, log the successful clip creation and resolve the promise
        cmd.on('end', () => {
            addLogMsg('General', 'REQ', 'Successfully created clip', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            addLogMsg('General', 'REQ', `Clip name: ${clipName}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            resolve();
        });

        // on error, log the error in clip creation and reject the promise
        cmd.on('error', (error) => {
            addLogMsg('General', 'ERROR', 'Couldn\'t create clip', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            addLogMsg('General', 'ERROR', `Error message: ${error}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            reject(error);
        });

        // set the video parameters, optimizing for file size
        cmd.setStartTime(clipStartTime);
        cmd.setDuration(clipEndTime - clipStartTime);
        cmd.size(`${getStg('clipsWidth')}x${getStg('clipsHeight')}`);  // set the clip size to the resolution stored in the settings
        cmd.fps(CLIP_FRAMERATE);  // set the framerate
        cmd.videoBitrate(CLIP_VIDEO_BITRATE);  // set the bitrate
        cmd.audioCodec(CLIP_AUDIO_CODEC);  // set the audio codec
        cmd.audioBitrate(CLIP_AUDIO_BITRATE);  // set the audio bitrate
        cmd.audioChannels(CLIP_AUDIO_CHANNELS);  // set the number of audio channels
        cmd.inputOptions(CLIP_THREADS);  // set the number of threads to change CPU usage
        cmd.videoCodec(CLIP_VIDEO_CODEC);  // set the video codec

        // set the output clip name
        cmd.output(path.join(getStg('clipsDirectory'), clipName));

        // run the command
        cmd.run();
    });
}

/**
 * Checks if the logs directory storage limit has been exceeded and removes the oldest log(s)
 */
export async function checkLogsDirSize() {
    // read the directory for files
    const filesFullNames = await atmpAsyncFunc(() => fs.readdir(LOGS_DIRECTORY), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to load the logs!', true);

    // filter the files for logs
    const logsFullNames = filesFullNames.filter(fileFullName => ['txt'].includes(path.extname(fileFullName).toLowerCase().replace('.', '')));

    // get the logs (data)
    const logs = await Promise.all(logsFullNames.map(async (logFullName) => { 
        // get the logs path and stats
        const logPath = path.join(LOGS_DIRECTORY, logFullName);
        const logStats = await atmpAsyncFunc(() => fs.stat(logPath), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to get info on the logs!', true);

        // return the logs date, path, and size
        return {
            'date': logStats.birthtime, 
            'path': logPath,  
            'size': logStats.size
        };
    }));

    // get the total size of the logs
    let logsSize = logs.reduce((sum, log) => sum + log['size'], 0);

    // sort the videos in descending order by date
    logs.sort((a, b) => b['date'] - a['date']);

    // continue while the storage limit is exceeded
    while (logsSize > LOGS_LIMIT * BYTES_IN_GIGABYTE) {
        // get the oldest log
        const log = logs.pop();
        
        // decrease the logs size
        logsSize -= log['size'];

        // delete the log
        await atmpAsyncFunc(() => fs.unlink(log['path']), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 'Failed to remove old logs!', true);
    }
}

/**
 * Gets the readable log time
 * 
 * @returns {string} The readable log time (hh:mm:ss)
 */
function getRdblLogTime() {
    // get the current date
    const curDate = new Date();

    // return the formatted log time
    return `${TIME_PAD(curDate.getHours())}:${TIME_PAD(curDate.getMinutes())}:${TIME_PAD(curDate.getSeconds())}`;
}

/**
 * Adds a log message to the console or log file
 * 
 * @param {string} proc - The process being logged
 * @param {string} event - The event being logged
 * @param {string} msg - The log message
 * @param {boolean} isFinalMsg - If the log is the final one in its set
 * @param {boolean} isSubMsg - If the log is a sub message in its set
 * @param {boolean} isCons - If the log is sent to console or a log file
 */
export async function addLogMsg(proc, event, msg, isFinalMsg = true, isSubMsg = false, isCons = true) {
    // get the log entry with the time
    const logEntry = `[${getRdblLogTime()}][${proc}][${EVENT_PAD(event.toUpperCase())}]: ${isSubMsg ? '  ' : ''}` + `${msg}${isFinalMsg ? `\n${LOGS_DIV}` : ''}`;
    
    // check if the log is for the console
    if (isCons) {
        // log to the console
        console.log(logEntry);
    }
    else {
        // log to the log file
        await atmpAsyncFunc(() => fs.appendFile(LOGS_PATH, logEntry + '\n'));
    }
}

/**
 * Opens the developer tools for the main window
 */
export function openDevTools() {
    mainWindow['webContents'].openDevTools();
}

/**
 * Sends an IPC event message to the renderer process
 * 
 * @param {string} event - The name of the event
 * @param  {...any} args - The arguments of the event
 */
export function sendIPC(event, ...args) {
    mainWindow['webContents'].send(event, ...args);
}

/**
 * Attempts an asynchronous function multiple times with a delay between each
 * 
 * @param {Function} asyncFunc - The asynchronous function
 * @param {number} atmps - The number of attempts
 * @param {number} delay - The delay between attempts in milliseconds
 * @param {string} text - The new text of the initialization or content status label
 * @param {boolean} isInit - If the asynchronous function is run during initialization
 * @returns {Promise} The result of the attempts
 */
export async function atmpAsyncFunc(asyncFunc, atmps = ASYNC_ATTEMPTS, delay = ASYNC_DELAY_IN_MSECONDS, text, isInit = false) {
    // repeat for the number of attempts
    for (let i = 1; i <= atmps; i++) {
        // try the asynchronous function
        try {
            return await asyncFunc();
        } 
        catch (error) {
            // check if attempts are remaining
            if (i < atmps) {
                // do another attempt after the delay
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            else {
                // log that an error has occurred
                addLogMsg('General', 'GEN', error);

                if (isInit) {
                    // add the new video to the gallery
                    mainWindow['webContents'].send('gen:reqSetInitStatLabelText', text);

                    // close CapCha after a delay
                    setTimeout(() => mainWindow.close(), CLOSE_DELAY);
                }
                else {
                    return Promise.reject(new Error("Rejected promise error"));
                }
            }
        }
    }
}