/**
 * Module for initializing the directories section for the main process
 * 
 * @module mainDirectoriesSection
 * @requires chokidar
 * @requires electron
 * @requires fluent-ffmpeg
 * @requires fs
 * @requires path
 * @requires util
 * @requires mainGeneral
 * @requires mainEditorSection
 * @requires mainSettings
 */
import chokidar from 'chokidar';
import { app, ipcMain, shell } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { BYTES_IN_GIGABYTE, ASYNC_ATTEMPTS, addLogMsg, sendIPC, atmpAsyncFunc } from './mainGeneral.js';
import { FFMPEG_PATH, FFPROBE_PATH } from './mainEditorSection.js';
import { getStg, getStgsDataSchema } from './mainSettings.js';

// directories section constants
// user data path
const USER_DATA_PATH = app.getPath('userData');

// thumbnail directories and size
export const CAPTURES_THUMBNAIL_DIRECTORY = path.join(USER_DATA_PATH, 'Thumbnails', 'Captures');
export const CLIPS_THUMBNAIL_DIRECTORY = path.join(USER_DATA_PATH, 'Thumbnails', 'Clips');
const THUMBNAIL_SIZE = '320x180';

// watcher stability threshold and poll interval
const WATCHER_STABILITY_THRESHOLD = 2000;
const WATCHER_POLL_INTERVAL = 100;

// directories section states
let capsWatch, clipsWatch;

// directories section captures, clips, and counts
let caps, clips, capsCounts, clipsCounts;

/**
 * Initializes the directories section variables
 */
export function initMainDirsSectVars() {
    // set the ffmpeg and ffprobe paths to local binaries
    ffmpeg.setFfmpegPath(FFMPEG_PATH);
    ffmpeg.setFfprobePath(FFPROBE_PATH);

    // captures and clips watcher
    capsWatch = null;
    clipsWatch = null;

    // caps, clips videos and counts
    caps = [];
    clips = [];
    capsCounts = {
        'normal': -1, 
        'size': -1
    };
    clipsCounts = {
        'normal': -1, 
        'size': -1
    };
}

/**
 * Initializes the directories section
 */
export async function initMainDirsSect() {
    // initializes the directories section
    await initDirsSect();

    // initializes the directories section listeners
    initDirsSectL();
}

/**
 * Initializes the directories section
 */
async function initDirsSect() {
    // start the captures and clips watchers
    await startWatch(getStg('capturesDirectory'), true);  // boolean1 isCaps
    await startWatch(getStg('clipsDirectory'), false);  // boolean1 isCaps
}

/**
 * Initializes the directories section listeners
 */
function initDirsSectL() {
    // on openDir, open the captures or clips directory
    ipcMain.handle('dirsSect:openDir', async (_, isCaps) => await atmpAsyncFunc(() => shell.openPath(getStg(isCaps ? 'capturesDirectory' : 'clipsDirectory'))));

    // on getAllVideos, get all the videos and counts for the captures or clips directory
    ipcMain.handle('dirsSect:getAllVideos', async (_, isCaps) => {
        // get the captures or clips variables
        const videosFrmtStr = isCaps ? 'capturesFormat' : 'clipsFormat';
        const videosDir = getStg(isCaps ? 'capturesDirectory' : 'clipsDirectory');
        const videosTbnlDir = isCaps ? CAPTURES_THUMBNAIL_DIRECTORY : CLIPS_THUMBNAIL_DIRECTORY;
        const videosCounts = isCaps ? capsCounts : clipsCounts;

        // reset the videos counts
        videosCounts['normal'] = 0, videosCounts['size'] = 0;

        // try to access the thumbnail directory
        try {
            await atmpAsyncFunc(() => fs.access(videosTbnlDir));
        }
        catch (_) {
            // create the thumbnail directory since it does not exist
            await atmpAsyncFunc(() => fs.mkdir(videosTbnlDir, { recursive: true }));  // don't need to check exist technically since recursive means no error on exist
        }

        // try to access the videos directory
        try {
            await atmpAsyncFunc(() => fs.access(videosDir));
        }
        catch (_) {
            // create the videos directory since it does not exist
            await atmpAsyncFunc(() => fs.mkdir(videosDir, { recursive: true }));  // don't need to check exist technically since recursive means no error on exist
        }

        // read the directory for files
        const filesFullNames = await atmpAsyncFunc(() => fs.readdir(videosDir));

        // filter the files for videos names
        const videosFullNames = filesFullNames.filter(fileFullName => getStgsDataSchema()[videosFrmtStr]['enum'].includes(path.extname(fileFullName).toLowerCase().replace('.', '')));

        // get the videos (data) and create the thumbnail for each video
        isCaps ? caps = await Promise.all(videosFullNames.map(videoFullName => getVideo(videoFullName, isCaps)))
            : clips = await Promise.all(videosFullNames.map(videoFullName => getVideo(videoFullName, isCaps)));

        // get the captures or clips variable
        const videos = isCaps ? caps : clips;

        // iterate through each video (backwards, since we may splice the array)
        for (let i = videos.length - 1; i > -1; i--) {
            // if the video is not corrupted, update the normal count and size
            if (videos[i] !== null) {
                videosCounts['normal']++;
                videosCounts['size'] += videos[i]['data']['size'];
            }
            else {
                // remove the corrupted video
                videos.splice(i, 1);
            }
        }

        // check if the storage limit has been exceeded
        await checkDirSize(isCaps);

        // return the videos and counts
        return [ videos, videosCounts['normal'], videosCounts['size'] ];
    });

    // on renVideo, rename the video from the captures or clips
    ipcMain.handle('dirsSect:renVideo', async (_, videoPath, videoName, videoExt) => {
        // renames the video
        await atmpAsyncFunc(() => fs.rename(videoPath, path.join(path.dirname(videoPath), videoName + videoExt)));
    });

    // on delVideo, delete the video from the captures or clips
    ipcMain.handle('dirsSect:delVideo', async (_, videoPath) => {
        // deletes the video
        await atmpAsyncFunc(() => fs.unlink(videoPath));
    });
}

/**
 * Starts the videos watcher listeners
 * 
 * @param {string} videosDir - The captures or clips directory
 * @param {boolean} isCaps - If the call is for captures or clips
 */
export async function startWatch(videosDir, isCaps) {
    // check if the operation is for captures or clips
    if (isCaps) {
        // close the old captures directory watcher
        if (capsWatch) {
            await capsWatch.close();
        }

        // create the new captures watcher
        capsWatch = chokidar.watch(videosDir, 
            { 
                'ignored': (capPath, capStats) => capStats?.isFile() && !getStgsDataSchema()['capturesFormat']['enum'].includes(path.extname(capPath).toLowerCase().replace('.', '')), 
                'ignoreInitial': true, 
                'awaitWriteFinish': { stabilityThreshold: WATCHER_STABILITY_THRESHOLD, pollInterval: WATCHER_POLL_INTERVAL }, 
                'depth': 0 
            })
    }
    else {
        // close the old clips directory watcher
        if (clipsWatch) {
            await clipsWatch.close();
        }

        // create the new clips watcher
        clipsWatch = chokidar.watch(videosDir, 
            { 
                'ignored': (clipPath, clipStats) => clipStats?.isFile() && !getStgsDataSchema()['clipsFormat']['enum'].includes(path.extname(clipPath).toLowerCase().replace('.', '')), 
                'ignoreInitial': true, 
                'awaitWriteFinish': { stabilityThreshold: WATCHER_STABILITY_THRESHOLD, pollInterval: WATCHER_POLL_INTERVAL }, 
                'depth': 0 
            });
    }

    // get the captures or clips variable
    const videosWatch = isCaps ? capsWatch : clipsWatch;

    // on add, log that a video has been added and request the renderer to add the new video
    videosWatch.on('add', async (videoPath) => {
        // get the captures or clips variables
        const videos = isCaps ? caps : clips;
        const videosCounts = isCaps ? capsCounts : clipsCounts;
        // get the video (data)
        const video = await getVideo(path.basename(videoPath), isCaps);

        // log that a new file was added to the captures or clips directory
        addLogMsg('Settings', 'ADD', 'New file added to the directory', false);  // boolean1 isFinalMsg
        addLogMsg('Settings', 'ADD', `isCaps: ${isCaps}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLogMsg('Settings', 'ADD', `filePath: ${videoPath}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // check if the video is not corrupted
        if (video !== null) {
            // update the normal count and size
            videosCounts['normal']++;
            videosCounts['size'] += video['data']['size'];

            // add the video to the captures or clips
            videos.push(video);

            // add the new video to the gallery
            sendIPC('dirsSect:reqAddVideo', video, isCaps);

            // check if the storage limit has been exceeded
            await checkDirSize(isCaps);
        }
    });

    // on unlink, log that a video has been deleted and request the renderer to remove the video
    videosWatch.on('unlink', async (videoPath) => {
        // get the captures or clips variables
        const videos = isCaps ? caps : clips;
        const videosCounts = isCaps ? capsCounts : clipsCounts;
        const videosTbnlDir = isCaps ? CAPTURES_THUMBNAIL_DIRECTORY : CLIPS_THUMBNAIL_DIRECTORY;

        // get the index of the video
        const index = videos.findIndex(video => video['data']['path'] === videoPath);

        // log that a new file was deleted from the captures or clips directory
        addLogMsg('Settings', 'DEL', 'File deleted from the directory', false);  // boolean1 isFinalMsg
        addLogMsg('Settings', 'DEL', `isCaps: ${isCaps}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLogMsg('Settings', 'DEL', `videoPath: ${videoPath}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // check if the video was found
        if (index !== -1) {
            // decrease the normal video count and size
            videosCounts['normal']--;
            videosCounts['size'] -= videos[index]['data']['size'];

            // remove the video from the videos array
            videos.splice(index, 1);

            // request the renderer to remove the video from the gallery
            sendIPC('dirsSect:reqDelVideo', path.basename(videoPath), isCaps);

            // delete the thumbnail image
            atmpAsyncFunc(() => fs.unlink(path.join(videosTbnlDir, `${path.parse(videoPath)['name']}.png`)));
        }
    });
}

/**
 * Checks if the captures or clips directory storage limit has been exceeded and removes the oldest video(s)
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
export async function checkDirSize(isCaps) {
    // get the captures or clips variables
    const videos = isCaps ? caps : clips;
    const videosCounts = isCaps ? capsCounts : clipsCounts;
    const videosLimitStr = isCaps ? 'capturesLimit' : 'clipsLimit';

    // sort the videos in descending order by date
    videos.sort((a, b) => b['data']['date'] - a['data']['date']);

    // check if the storage is being limited
    if (getStg(videosLimitStr) !== 0) {
        // get the videos list length, removal size, and removal array
        let i = videos.length;
        let remSize = 0;
        const remVideos = [];

        // continue while the storage limit is exceeded
        while (videosCounts['size'] - remSize > getStg(videosLimitStr) * BYTES_IN_GIGABYTE) {
            // decrement the index
            i -= 1;

            // get the video at the index
            const video = videos[i];
            
            // increment the removed size variable and add the video to the removed array
            remSize += video['data']['size'];
            remVideos.push(video);
        }

        // iterate through each video in the removed videos array
        for (const remVideo of remVideos) {
            // delete the video
            await atmpAsyncFunc(() => fs.unlink(remVideo['data']['path']));
        }
    }
}

/**
 * Gets the data of the video
 * 
 * @param {string} videoFullName - The full name of the video
 * @param {boolean} isCaps - If the call is for captures or clips
 * @returns {Object} The video (data)
 */
async function getVideo(videoFullName, isCaps) {
    // turn ffprobe into a promise based function and get the basic video data
    const ffprobeProm = promisify(ffmpeg.ffprobe);
    const videoName = path.parse(videoFullName)['name'];
    const videoParsedName = videoFullName.split('-CC');
    const videoPath = path.join(getStg(isCaps ? 'capturesDirectory' : 'clipsDirectory'), videoFullName);
    const videoStats = await atmpAsyncFunc(() => fs.stat(videoPath));
    const videosTbnlDir = isCaps ? CAPTURES_THUMBNAIL_DIRECTORY : CLIPS_THUMBNAIL_DIRECTORY;
    const videoTbnlPath = path.join(videosTbnlDir, `${videoName}.png`);
    let videoProbe;

    // try to get the video data (video may be corrupted)
    try {
        // get the video fps data (failure if the video is corrupted)
        videoProbe = await atmpAsyncFunc(() => ffprobeProm(videoPath), ASYNC_ATTEMPTS, 100);
    }
    // catch the error and return null to indicate the video is corrupted
    catch (_) {
        return null;
    }

    // try to access the video thumbnail
    try {
        await atmpAsyncFunc(() => fs.access(videoTbnlPath));
    }
    catch (_) {
        // create the thumbnail since it does not exist
        await atmpAsyncFunc(() => new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .on('end', resolve)
                .on('error', reject)
                .screenshots({
                    'timestamps': ['50%'],
                    'filename': videoName,
                    'folder': videosTbnlDir,
                    'size': THUMBNAIL_SIZE
                });
        }));
    }

    // return the data on the video
    return {
        'data': { 
            'date': videoStats.birthtime, 
            'dur': videoProbe.format.duration, 
            'prog': videoParsedName[1] ? videoParsedName[0] : 'External',  // set the program to External if it cannot be parsed
            'ext': path.extname(videoFullName).replace('.', ''), 
            'fullName': videoFullName, 
            'fps': videoProbe.streams.find(stream => stream.codec_type === 'video').r_frame_rate.split('/').map(Number).reduce((a, b) => a / b),  // get the video fps
            'name': videoName, 
            'path': videoPath, 
            'size': videoStats.size, 
            'tbnlPath': videoTbnlPath 
        }
    };
}