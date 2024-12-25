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
    mostSettingFields, clipsFormatSettingFields, clipsWidthSettingFields, clipsHeightSettingFields, mostSettingToggleSwitches, capturesPathSettingField, clipsPathSettingField, darkModeSettingToggleField, darkModeSettingToggleIcon, capturesDisplaySettingField, 
    speakerSettingField, speakerVolumeSlider, speakerVolumeSliderWidth, speakerVolumeOverlay, speakerVolumeThumb, microphoneSettingField, microphoneVolumeSlider, microphoneVolumeSliderWidth, microphoneVolumeOverlay, microphoneVolumeThumb, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setIcon, getParsedTime, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';
import { initRendNavBlock, toggleRecordBtn } from './rendNavBlock.js';
import { updateSpeakerVolumeSlider, updateMicrophoneVolumeSlider } from './rendSettingsSection.js';
import { initRendDirectoriesSection, loadCapturesGallery, updateCapturesGallery, toggleCapturesGalleryBtn, getReadableAge, loadClipsGallery, updateClipsGallery, toggleClipsGalleryBtn } from './rendDirectoriesSection.js';
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
        updateClipsGallery();
        updateCapturesGallery();
        updateSeekSlider();
        updateTimelineSlider();
        updateVolumeSlider();
        updateSpeakerVolumeSlider();
        updateMicrophoneVolumeSlider();
        updatePlaybackRateSlider();
    });
}

/**
 * Initializes the inter-process communication callbacks for the renderer process
 */
function initGeneralIPC() {
    // // on request, load the captures gallery
    // window.filesAPI.reqLoadCapturesGallery(async () => {
    //     // set initialization to false since this is guaranteed to be not the first run
    //     await loadCapturesGallery(false); 
    // });

    // // on request, load the clips gallery
    // window.filesAPI.reqLoadClipsGallery(async () => {
    //     // set initialization to false since this is guaranteed to be not the first run
    //     await loadClipsGallery(false); 
    // });

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