/**
 * Module for providing shared utility functions
 * 
 * @module rendSharedFunctions
 * @requires rendEditorSection
 * @requires rendDirectoriesSection
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
import { initRendEditorSection, setVideoPlayerState, resizeseekSlider, resizeTimelineSlider, getReadableDuration } from './rendEditorSection.js';
import { initRendDirectoriesSection, loadGallery, resizeGallery } from './rendDirectoriesSection.js';
import { setInitializationStatusLabel, setGeneralStatusLabel } from './rendGeneral.js';

/**
 * @exports setSVG, getParsedTime, resizeAll, setActiveSection, attemptAsyncFunction
 */
export { setSVG, getParsedTime, resizeAll, setActiveSection, attemptAsyncFunction };

/**
 * Sets the SVG of an element
 * 
 * @param {HTMLElement} elementSVG - The SVG element
 * @param {string} name - The name of the new SVG
 */
function setSVG(elementSVG, name) {
    elementSVG.setAttribute('href', `../assets/svg/${name}.svg#${name}`);
}

/**
 * Gets the days, hours, minutes, and seconds of the time
 * 
 * @param {number} time - The time in seconds
 * @returns {number[]} The days, hours, minutes, seconds of the time
 */
function getParsedTime(time) {    
    return [Math.floor(time / SECONDS_IN_DAY), Math.floor(time % SECONDS_IN_DAY / SECONDS_IN_HOUR), Math.floor(time % SECONDS_IN_HOUR / SECONDS_IN_MINUTE), Math.floor(time % SECONDS_IN_MINUTE)];
}

/**
 * Resizes the gallery, playback slider, and timeline slider
 */
function resizeAll() {
    resizeGallery();
    resizeseekSlider();
    resizeTimelineSlider();
}

/**
 * Sets the active section
 * 
 * @param {string} section - The section to set active
 */
function setActiveSection(section) {
    switch (section) {
        case 'directories':
            // change the active content section to the directories section
            settingsSection.classList.remove('active');
            editorSection.classList.remove('active');
            directoriesSection.classList.add('active');

            // unload the editor video
            if (flags['videoLoaded']) {
                flags['videoLoaded'] = false;
                setVideoPlayerState('standby');
            }
            break;
        case 'settings':
            // change the active content section to the settings section
            directoriesSection.classList.remove('active');
            editorSection.classList.remove('active');
            settingsSection.classList.add('active');

            // unload the editor video
            if (flags['videoLoaded']) {
                flags['videoLoaded'] = false;
                setVideoPlayerState('standby');
            }
            break;
        case 'editor':
            // change the active content section to the editor section
            directoriesSection.classList.remove('active');
            settingsSection.classList.remove('active');
            editorSection.classList.add('active');
            break;
    }
}

/**
 * Attempts an asynchronous function multiple times with a delay
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
                if (initialization) {
                    setInitializationStatusLabel(`Attempt ${i} failed!`);
                }
                else {
                    generalStatusLabel.classList.add('active');
                    setGeneralStatusLabel(`Attempt ${i} failed!`);
                }

                await new Promise(resolve => setTimeout(resolve, delay));
            }
            // throw an error
            else {
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