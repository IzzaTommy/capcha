/**
 * Module for initializing the window
 * 
 * @module window
 * @requires variables
 * @requires shared
 * @requires directoriesSection
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
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, timelineState, 
    allSettingPill, allSettingToggleSwitch, saveLocationSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, animationFrame 
} from './variables.js';
import { setSVG, getParsedTime, resizeAll } from './shared.js';
import { loadGallery } from './directoriesSection.js';

/**
 * @exports initWindow
 */
export { initWindow };

/**
 * Initializes the window
 */
function initWindow() {
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