/**
 * Module for initializing the window
 * 
 * @module rendWindow
 * @requires rendVariables
 * @requires rendShared
 * @requires rendDirectoriesSection
 */
import { 
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    html, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentVideoTimeLabel, totalVideoTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, timelineState, 
    allSettingPill, allSettingToggleSwitch, capturesPathSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, stateData 
} from './rendVariables.js';
import { setSVG, getParsedTime, resizeAll } from './rendShared.js';
import { loadGallery } from './rendDirectoriesSection.js';

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
}