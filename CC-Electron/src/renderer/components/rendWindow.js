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
    navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, currentRecordingTimeLabel, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseStatusSVG, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentVideoTimeLabel, totalVideoTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, 
    allSettingPill, allSettingToggleSwitch, capturesPathSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, state 
} from './rendVariables.js';
import { setSVG, getParsedTime, resizeAll, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';
import { loadGallery } from './rendDirectoriesSection.js';
import { setActiveRecordBtn } from './rendNavBlock.js';

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
    window.settingsAPI.reqVolumeSettings(() => {
        window.settingsAPI.setVolumeSettings({ 'volume': data['settings']['volume'], 'volumeMuted': data['settings']['volumeMuted'] });
    });

    window.webSocketAPI.reqSetActiveRecordBtn(() => {
        setActiveRecordBtn();
    });
}