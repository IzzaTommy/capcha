/**
 * Module for initializing the window
 * 
 * @module rendWindow
 * @requires rendVariables
 * @requires rendSharedFunctions
 * @requires rendDirectoriesSection
 */
import { 
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    MSECONDS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    html, 
    initializationOverlay, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, recordingContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordSVG, resumeAutoRecordLabel, 
    navToggleBtn, navToggleSVG, 
    directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseStatusSVG, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentVideoTimeLabel, totalVideoTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, 
    allSettingPill, allSettingToggleSwitch, capturesPathSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setSVG, getParsedTime, resizeAll, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';
import { initRendDirectoriesSection, loadGallery, resizeGallery } from './rendDirectoriesSection.js';
import { initRendNavBlock, toggleRecordBtn } from './rendNavBlock.js';

/**
 * @exports initRendWindow
 */
export { initRendWindow };

/**
 * Initializes the window
 */
function initRendWindow() {
    initWindowEL();
    initWindowIPC();
}

/**
 * Initializes the window event listener
 */
function initWindowEL() {
    // on resize, resize all width dependent elements
    window.addEventListener('resize', () => {
        resizeAll();
    });
}

/**
 * Initializes the window inter-process communication callbacks
 */
function initWindowIPC() {
    // on request, load the gallery
    window.filesAPI.reqLoadGallery(() => { 
        loadGallery(); 
    });

    // on request, set the volume and volume mute status
    window.settingsAPI.reqVolumeSettings(async () => {
        // not run in Promise.all because updating volumeMuted is set to end the program
        await attemptAsyncFunction(() => window.settingsAPI.setSetting('volume', data['settings']['volume']), 3, 2000);
        await attemptAsyncFunction(() => window.settingsAPI.setSetting('volumeMuted', data['settings']['volumeMuted']), 3, 2000);
    });

    // on request, toggle the record button
    window.webSocketAPI.reqToggleRecordBtn(async (recordingGame) => {
        await toggleRecordBtn(true, false, recordingGame);
    });
}