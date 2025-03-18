/**
 * Module for initializing the editor section for the main process
 * 
 * @module mainEditorSection
 * @requires electron
 * @requires fluent-ffmpeg
 * @requires path
 * @requires mainGeneral
 * @requires mainSettings
 */
import { ipcMain } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { TIME_PAD, addLogMsg, atmpAsyncFunc } from './mainGeneral.js';
import { getStg } from './mainSettings.js';

// editor section constants
// clip parameters
const CLIP_FRAMERATE = 30;
const CLIP_VIDEO_BITRATE = '4000k';
const CLIP_AUDIO_CODEC = 'aac';
const CLIP_AUDIO_BITRATE = '96k';
const CLIP_AUDIO_CHANNELS = 1;
const CLIP_THREADS = '-threads 2';
const CLIP_VIDEO_CODEC = 'h264_nvenc';

/**
 * Initializes the editor section
 */
export function initMainEditSect() {
    // initialize the editor section listener
    initEditSectL();
}

/**
 * Initializes the editor section listener
 */
function initEditSectL() {
    // on createClip, create a clip of the video with the given clip start and end times
    ipcMain.handle('editSect:reqCreateClip', async (_, videoPath, clipStartTime, clipEndTime) => await atmpAsyncFunc(() => createClip(videoPath, clipStartTime, clipEndTime), 1));
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