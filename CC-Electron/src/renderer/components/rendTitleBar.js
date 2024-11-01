/**
 * Module for initializing the title bar
 * 
 * @module rendTitleBar
 * @requires rendVariables
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

/**
 * @exports initRendTitleBar
 */
export { initRendTitleBar };

/**
 * Initializes the title bar and its components
 */
function initRendTitleBar() {
    initTitleBtnEL();
}

/**
 * Initializes the title button event listeners
 */
function initTitleBtnEL() {
    // on click, minimize the window
    minimizeBtn.addEventListener('click', window.windowAPI.minimize);
    // on click, maximize the window
    maximizeBtn.addEventListener('click', window.windowAPI.maximize);
    // on click, close the window
    closeBtn.addEventListener('click', window.windowAPI.close);
}