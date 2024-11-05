/**
 * Module for initializing the nav block
 * 
 * @module rendWindow
 * @requires rendVariables
 * @requires rendSharedFunctions
 * @requires rendEditorSection
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
import { getReadableDuration } from './rendEditorSection.js';
import { loadGallery } from './rendDirectoriesSection.js';

/**
 * @exports initRendNavBlock
 */
export { initRendNavBlock, setActiveRecordBtn };

/**
 * Initializes the nav block and its components
 */
function initRendNavBlock() {
    initNavBtnEL();
    initNavToggleBtnEL();
    initNavToggleBtn();
}

/**
 * Initializes the nav button event listeners
 */
function initNavBtnEL() {
    // on mouse enter, change to the solid SVG
    directoriesBtn.addEventListener('mouseenter', () => setSVG(directoriesSVG, 'folder-solid'));
    // on mouse leave, change to the regular SVG
    directoriesBtn.addEventListener('mouseleave', () => setSVG(directoriesSVG, 'folder'));
    // on click, change the active content section to the directories section
    directoriesBtn.addEventListener('click', () => setActiveSection('directories'));

    // on mouse enter, change to the solid SVG
    settingsBtn.addEventListener('mouseenter', () => setSVG(settingsSVG, 'settings-solid'));
    // on mouse leave, change to the regular SVG
    settingsBtn.addEventListener('mouseleave', () => setSVG(settingsSVG, 'settings'));
    // on click, change the active content section to the settings section
    settingsBtn.addEventListener('click', () => setActiveSection('settings'));

    // on mouse enter, change to the solid SVG
    recordBtn.addEventListener('mouseenter', () => setSVG(recordSVG, 'record-solid'));
    // on mouse leave, change to the regular SVG
    recordBtn.addEventListener('mouseleave', () => setSVG(recordSVG, 'record'));


    
    // on click, toggle the recording
    recordBtn.addEventListener('click', async () => await setActiveRecordBtn());
}

/**
 * Initializes the nav toggle button event listener
 */
function initNavToggleBtnEL() {
    // on click, change the nav bar state
    navToggleBtn.addEventListener('click', async () => {
        // toggle the nav bar
        navBar.classList.toggle('active');

        // change the SVG and save the setting, depending on if the nav bar is active
        if (navBar.classList.contains('active')) {
            setSVG(navToggleSVG, 'arrow-back-ios');
            data['settings']['navBarActive'] = await attemptAsyncFunction(() => window.settingsAPI.setSetting('navBarActive', true), 3, 2000);
        }
        else {
            setSVG(navToggleSVG, 'arrow-forward-ios');
            data['settings']['navBarActive'] = await attemptAsyncFunction(() => window.settingsAPI.setSetting('navBarActive', false), 3, 2000);
        }

        // resize all width dependent elements
        resizeAll();
    });
}

/**
 * Initializes the nav toggle button
 */
function initNavToggleBtn() {
    // toggle the nav bar and change the SVG, depending on setting
    if (data['settings']['navBarActive'] === true) {
        setSVG(navToggleSVG, 'arrow-back-ios');
        navBar.classList.toggle('active');
    }

    // resize all width dependent elements
    resizeAll();
}

// JSDocs
async function setActiveRecordBtn() {
    if (flags['recording']) {
        if (await attemptAsyncFunction(() => window.webSocketAPI.stopRecord(), 3, 2000)) {
            flags['recording'] = false;
            recordBtn.classList.toggle('active');
            
            clearInterval(state['timerInterval']);

            loadGallery();
        }
    }
    else {
        if (await attemptAsyncFunction(() => window.webSocketAPI.startRecord(), 3, 2000)) {
            flags['recording'] = true;
            recordBtn.classList.toggle('active');

            state['recordingTime'] = 0;
            state['timerInterval'] = setInterval(() => {
                state['recordingTime']++;
                currentRecordingTimeLabel.textContent = getReadableDuration(state['recordingTime']);
            }, 1000);
        }
    }
}