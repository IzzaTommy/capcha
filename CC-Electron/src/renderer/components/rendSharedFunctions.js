/**
 * Module for providing shared utility functions
 * 
 * @module rendSharedFunctions
 * @requires rendGeneral
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
    mostSettingFields, clipsFormatSettingFields, clipsWidthSettingFields, clipsHeightSettingFields, mostSettingToggleSwitches, capturesPathSettingField, clipsPathSettingField, darkModeSettingToggleField, darkModeSettingToggleIcon, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { initRendGeneral, setInitializationStatusLabel, setGeneralStatusLabel } from './rendGeneral.js';
import { initRendEditorSection, setVideoPlayerState, updateSeekSlider, updateTimelineSlider, updateVolumeSlider, updatePlaybackRateSlider, getReadableDuration } from './rendEditorSection.js';

/**
 * @exports setIcon, getParsedTime, setActiveSection, attemptAsyncFunction
 */
export { setIcon, getParsedTime, setActiveSection, attemptAsyncFunction };

/**
 * Sets the icon (SVG) of an element
 * 
 * @param {HTMLElement} elementIcon - The icon element
 * @param {string} name - The name of the new SVG
 */
function setIcon(elementIcon, name) {
    elementIcon.setAttribute('href', `../assets/svg/${name}.svg#${name}`);
}

/**
 * Gets the [days, hours, minutes, and seconds] of the time
 * 
 * @param {number} time - The time in seconds
 * @returns {number[]} The [days, hours, minutes, seconds] of the time
 */
function getParsedTime(time) {
    return [Math.floor(time / SECONDS_IN_DAY), Math.floor(time % SECONDS_IN_DAY / SECONDS_IN_HOUR), Math.floor(time % SECONDS_IN_HOUR / SECONDS_IN_MINUTE), Math.floor(time % SECONDS_IN_MINUTE)];
}

/**
 * Sets the active content section
 * 
 * @param {string} section - The section to set active (directories, editor, or settings)
 */
function setActiveSection(section) {
    switch (section) {
        case 'directories':
            // change the active content section to the directories section
            settingsSection.classList.remove('active');
            editorSection.classList.remove('active');
            directoriesSection.classList.add('active');

            setIcon(clipToggleIcon, 'arrow-forward-ios');
            clipBar.classList.remove('active');
            clipLeftThumb.classList.remove('active');
            clipRightThumb.classList.remove('active');

            // unload the editor video
            if (flags['videoLoaded']) {
                flags['videoLoaded'] = false;
                
                // standby will pause the video but hide the play pause icon overlay
                setVideoPlayerState('standby');
            }
            break;
        case 'editor':
            // change the active content section to the editor section
            directoriesSection.classList.remove('active');
            settingsSection.classList.remove('active');
            editorSection.classList.add('active');
            break;
        case 'settings':
            // change the active content section to the settings section
            directoriesSection.classList.remove('active');
            editorSection.classList.remove('active');
            settingsSection.classList.add('active');

            setIcon(clipToggleIcon, 'arrow-forward-ios');
            clipBar.classList.remove('active');
            clipLeftThumb.classList.remove('active');
            clipRightThumb.classList.remove('active');

            // unload the editor video
            if (flags['videoLoaded']) {
                flags['videoLoaded'] = false;

                // standby will pause the video but hide the play pause icon overlay
                setVideoPlayerState('standby');
            }
            break;
    }
}

/**
 * Attempts an asynchronous function multiple times with a delay between each
 * 
 * @param {Function} asyncFunction - The asynchronous function
 * @param {number} attempts - The number of attempts
 * @param {number} delay - The delay between attempts in milliseconds
 * @param {boolean} initialization - if the asynchronous function is for initialization
 * @returns {Promise} The result of the attempts
 */
async function attemptAsyncFunction(asyncFunction, attempts, delay, initialization) {
    // iterate through each attempt
    for (let i = 1; i <= attempts; i++) {
        // try the asynchronous function
        try {
            return await asyncFunction();
        }
        catch (error) {
            // do another attempt after the delay
            if (i < attempts) {
                //  set the right text label if this is an initialization or general error
                if (initialization) {
                    setInitializationStatusLabel(`Attempt ${i} failed!`);
                }
                else {
                    generalStatusLabel.classList.add('active');
                    setGeneralStatusLabel(`Attempt ${i} failed!`);
                }

                await new Promise(resolve => setTimeout(resolve, delay));
            }
            // throw an error if there are no more attempts
            else {
                //  set the right text label if this is an initialization or general error
                if (initialization) {
                    setInitializationStatusLabel('An Error Occurred!');
                    // closing code...
                }
                else {
                    generalStatusLabel.classList.add('active');
                    setGeneralStatusLabel('An Error Occurred!');
                }
            }
        }
    }
}