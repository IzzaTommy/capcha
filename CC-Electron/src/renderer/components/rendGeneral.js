/**
 * Module for initializing general components
 * 
 * @module rendGeneral
 * @requires rendVariables
 * @requires rendSharedFunctions
 * @requires rendNavBlock
 * @requires rendDirectoriesSection
 * @requires rendEditorSection
 */
import {
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    MSECONDS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, PLAYBACK_RATE_MAPPING, 
    html, 
    initializationOverlay, initializationStatusLabel, 
    titleBar, minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesIcon, settingsBtn, settingsIcon, currentRecordingLabelContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordIcon, autoRecordResumeLabel, 
    navToggleBtn, navToggleIcon, 
    generalStatusLabel, directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
    mediaBar, playPauseBtn, playPauseIcon, 
    volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
    currentVideoTimeLabel, currentVideoDurationLabel, 
    playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
    fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineThumb, 
    mostSettingFields, mostSettingToggleFields, capturesPathSettingField, darkModeSettingToggleField, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setIcon, getParsedTime, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';
import { initRendNavBlock, toggleRecordBtn } from './rendNavBlock.js';
import { initRendDirectoriesSection, loadGallery, updateGallery, getReadableAge, toggleCapturesGalleryBtn } from './rendDirectoriesSection.js';
import { updateSeekSlider, updateTimelineSlider, updateVolumeSlider, updatePlaybackRateSlider } from './rendEditorSection.js';

/**
 * @exports initRendGeneral, setInitializationStatusLabel, setGeneralStatusLabel
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
    // on resize, update all width/location dependent elements
    window.addEventListener('resize', () => {
        updateGallery();
        updateSeekSlider();
        updateTimelineSlider();
        updateVolumeSlider();
        updatePlaybackRateSlider();
    });
}

/**
 * Initializes the inter-process communication callbacks for the renderer process
 */
function initGeneralIPC() {
    // on request, load the gallery
    window.filesAPI.reqLoadGallery(async () => {
        // set initialization to false since this is guaranteed to be not the first run
        await loadGallery(false); 
    });

    // on request, set the volume and volume mute settings in main
    window.settingsAPI.reqVolumeSettings(async () => {
        // not run in Promise.all because updating volumeMuted is set to end the program
        await attemptAsyncFunction(() => window.settingsAPI.setSetting('volume', data['settings']['volume']), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        await attemptAsyncFunction(() => window.settingsAPI.setSetting('volumeMuted', data['settings']['volumeMuted']), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
    });

    // on request, toggle the record button (initiated from the main auto recording process)
    window.webSocketAPI.reqToggleRecordBtn(async (recordingGame) => {
        await attemptAsyncFunction(() => toggleRecordBtn(true, false, recordingGame), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
    });
}

/**
 * Sets the initialization status label text
 * 
 * @param {string} message - The new label text
 */
function setInitializationStatusLabel(message) {
    initializationStatusLabel.textContent = message;
}

/**
 * Sets the general status label text
 * 
 * @param {string} message - The new label text
 */
function setGeneralStatusLabel(message) {
    generalStatusLabel.textContent = message;

    // hide the label after 5 seconds
    if (state['generalStatusTimeout']) {
        clearTimeout(state['generalStatusTimeout']);
    }
    state['generalStatusTimeout'] = setTimeout(() => generalStatusLabel.classList.remove('active'), 5000);
}