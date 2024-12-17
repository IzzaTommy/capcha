/**
 * Module for initializing the title bar
 * 
 * @module rendTitleBar
 * @requires rendVariables
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
    videoPreviewTemplate, videoPreviewWidth, capturesGallery, capturesLeftBtn, capturesRightBtn, clipsGallery, clipsLeftBtn, clipsRightBtn, 
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
    mediaBar, playPauseBtn, playPauseIcon, 
    volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
    currentVideoTimeLabel, currentVideoDurationLabel, 
    playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
    fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineThumb, clipLeftThumb, clipRightThumb, 
    clipBar, clipViewBtn, clipCreateBtn, clipToggleBtn, clipToggleIcon, 
    mostSettingFields, clipsFormatSettingFields, clipsWidthSettingFields, clipsHeightSettingFields, mostSettingToggleSwitches, capturesPathSettingField, clipsPathSettingField, darkModeSettingToggleField, darkModeSettingToggleIcon, 
    speakerVolumeSlider, speakerVolumeSliderWidth, speakerVolumeOverlay, speakerVolumeThumb, microphoneVolumeSlider, microphoneVolumeSliderWidth, microphoneVolumeOverlay, microphoneVolumeThumb, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setIcon, getParsedTime, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';

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
    closeBtn.addEventListener('click', async () => {
        // not run in Promise.all because updating volumeMuted is set to end the program
        await attemptAsyncFunction(() => window.settingsAPI.setSetting('volume', data['settings']['volume']), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        await attemptAsyncFunction(() => window.settingsAPI.setSetting('volumeMuted', data['settings']['volumeMuted']), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

        window.windowAPI.closeWindow();
    });
}