/**
 * Module for providing shared utility functions
 * 
 * @module shared
 * @requires editorSection
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
import { resizePlaybackSlider, resizeTimelineSlider } from './editorSection.js';
import { resizeGallery } from './directoriesSection.js';

/**
 * @exports setSVG, getParsedTime, resizeAll, setActiveSection
 */
export { setSVG, getParsedTime, resizeAll, setActiveSection };

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
    resizePlaybackSlider();
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
            flags['videoLoaded'] = false;
            break;
        case 'settings':
            // change the active content section to the settings section
            directoriesSection.classList.remove('active');
            editorSection.classList.remove('active');
            settingsSection.classList.add('active');

            // unload the editor video
            flags['videoLoaded'] = false;
            break;
        case 'editor':
            // change the active content section to the editor section
            directoriesSection.classList.remove('active');
            settingsSection.classList.remove('active');
            editorSection.classList.add('active');
            break;
        default:
    }
}