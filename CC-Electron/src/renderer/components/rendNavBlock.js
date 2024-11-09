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
    navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, recordingContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordSVG, resumeAutoRecordLabel, 
    navToggleBtn, navToggleSVG, 
    directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseStatusSVG, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentVideoTimeLabel, totalVideoTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, 
    allSettingPill, allSettingToggleSwitch, capturesPathSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setSVG, getParsedTime, resizeAll, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';
import { initRendEditorSection, resizePlaybackSlider, resizeTimelineSlider, getReadableDuration } from './rendEditorSection.js';
import { initRendDirectoriesSection, loadGallery, resizeGallery } from './rendDirectoriesSection.js';

/**
 * @exports initRendNavBlock
 */
export { initRendNavBlock, toggleRecordBtn };

/**
 * Initializes the nav block
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
    recordBtn.addEventListener('click', async () => await toggleRecordBtn(false, true, 'MANUAL'));

    // on click, reallow auto recording
    resumeAutoRecordLabel.addEventListener('click', () => { 
        flags['manualStop'] = false;
        resumeAutoRecordLabel.classList.remove('active');
     });
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

        // hide the resumeAutoRecord label, then show it again after 500 ms
        resumeAutoRecordLabel.style.opacity = '0';
        await new Promise(resolve => setTimeout(() => { resumeAutoRecordLabel.style.opacity = ''; resolve(); }, 500));

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
        navBar.classList.add('active');
    }

    // resize all width dependent elements
    resizeAll();
}

/**
 * Toggles the record button
 * 
 * @param {boolean} autoStart - if function is called by the main process
 * @param {boolean} manualStop - if function is called by record button click
 */
async function toggleRecordBtn(autoStart, manualStop, recordingGame) {
    // check if recording is in progress
    if (flags['recording']) {
        // check if it was a manual start / manual stop or auto start / auto stop or auto start / manual stop
        if ((!flags['autoStart'] && manualStop) || (flags['autoStart'] && !manualStop) || (flags['autoStart'] && manualStop)) {
            // stop recording
            if (await attemptAsyncFunction(() => window.webSocketAPI.stopRecord(), 3, 2000)) {
                // set the manual stop flag
                flags['manualStop'] = manualStop;

                // set recording flag, toggle the record button, toggle the recording container
                flags['recording'] = false;
                recordBtn.classList.remove('active');
                recordingContainer.classList.remove('active');
                
                // clear the recording time label interval
                clearInterval(state['timerInterval']);

                // check if auto record is on and the recording was manually stopped
                if (flags['manualStop'] && data['settings']['autoRecord']) {
                    // reallow auto recording
                    resumeAutoRecordLabel.classList.add('active');
                }

                // reload the gallery for the new video
                loadGallery();
            }
        }
    }
    else {
        // check if it was an auto start / with no manual pause or if it was a manual start
        if ((autoStart && !flags['manualStop']) || !autoStart) {
            if (await attemptAsyncFunction(() => window.webSocketAPI.startRecord(), 3, 2000)) {
                // set auto start flag
                flags['autoStart'] = autoStart;

                // set recording flag, toggle the record button, toggle the recording container
                flags['recording'] = true;
                recordBtn.classList.add('active');
                recordingContainer.classList.add('active');

                // set the recording game
                currentRecordingGameLabel.textContent = recordingGame;

                // restart the recording time and set the recording time label interval
                state['recordingTime'] = 0;
                currentRecordingTimeLabel.textContent = getReadableDuration(state['recordingTime']);
                state['timerInterval'] = setInterval(() => {
                    state['recordingTime']++;
                    currentRecordingTimeLabel.textContent = getReadableDuration(state['recordingTime']);
                }, 1000);
            }
        }
    }
}