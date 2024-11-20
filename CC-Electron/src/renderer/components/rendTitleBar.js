/**
 * Module for initializing the title bar
 * 
 * @module rendTitleBar
 * @requires rendVariables
 */
import { 
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    MSECONDS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, 
    html, 
    initializationOverlay, initializationStatusLabel, 
    titleBar, minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesIcon, settingsBtn, settingsIcon, currentRecordingLabelContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordIcon, autoRecordResumeLabel, 
    navToggleBtn, navToggleIcon, 
    generalStatusLabel, directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekThumb, 
    playPauseBtn, playPauseIcon, volumeBtn, volumeIcon, volumeSlider, currentVideoTimeLabel, currentVideoDurationLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, 
    mostSettingFields, mostSettingToggleFields, capturesPathSettingField, darkModeSettingToggleField, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';

/**
 * @exports initRendTitleBar
 */
export { initRendTitleBar };

/**
 * Initializes the title bar
 */
function initRendTitleBar() {
    initTitleBtnEL();
}

/**
 * Initializes the title button event listeners
 */
function initTitleBtnEL() {
    // on click, minimize the window
    minimizeBtn.addEventListener('click', window.windowAPI.minimizeWindow);
    // on click, maximize the window
    maximizeBtn.addEventListener('click', window.windowAPI.maximizeWindow);
    // on click, close the window
    closeBtn.addEventListener('click', window.windowAPI.closeWindow);
}