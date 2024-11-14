/**
 * Module for initializing general components
 * 
 * @module rendGeneral
 * @requires rendVariables
 * @requires rendSharedFunctions
 * @requires rendDirectoriesSection
 */
import { 
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    MSECONDS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, 
    html, 
    initializationOverlay, initializationStatusLabel, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, recordingContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordSVG, resumeAutoRecordLabel, 
    navToggleBtn, navToggleSVG, 
    generalStatusLabel, directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseStatusIcon, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, currentSpeedLabel, fullscreenBtn, fullscreenSVG, 
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
 * @exports initRendGeneral
 */
export { initRendGeneral, setInitializationStatusLabel, setGeneralStatusLabel };

/**
 * Initializes general components
 */
function initRendGeneral() {
    initGeneralEL();
    initGeneralIPC();
}

/**
 * Initializes general event listeners
 */
function initGeneralEL() {
    // on resize, resize all width dependent elements
    window.addEventListener('resize', () => {
        resizeAll();
    });
}

/**
 * Initializes the inter-process communication callbacks
 */
function initGeneralIPC() {
    // on request, load the gallery
    window.filesAPI.reqLoadGallery(async () => { 
        await loadGallery(false); 
    });

    // on request, set the volume and volume mute status
    window.settingsAPI.reqVolumeSettings(async () => {
        // not run in Promise.all because updating volumeMuted is set to end the program
        await attemptAsyncFunction(() => window.settingsAPI.setSetting('volume', data['settings']['volume']), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        await attemptAsyncFunction(() => window.settingsAPI.setSetting('volumeMuted', data['settings']['volumeMuted']), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
    });

    // on request, toggle the record button
    window.webSocketAPI.reqToggleRecordBtn(async (recordingGame) => {
        await attemptAsyncFunction(() => toggleRecordBtn(true, false, recordingGame), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
    });
}

function setInitializationStatusLabel(message) {
    initializationStatusLabel.textContent = message;
}

function setGeneralStatusLabel(message) {
    generalStatusLabel.textContent = message;

    if (state['generalStatusTimeout']) {
        clearTimeout(state['generalStatusTimeout']);
    }
    state['generalStatusTimeout'] = setTimeout(() => generalStatusLabel.style.visibility = 'hidden', 5000);
}