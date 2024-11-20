/**
 * Module for initializing the nav block
 * 
 * @module rendNavBlock
 * @requires rendVariables
 * @requires rendSharedFunctions
 * @requires rendEditorSection
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
import { setSVG, getParsedTime, resizeAll, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';
import { initRendEditorSection, setVideoPlayerState, resizeseekSlider, resizeTimelineSlider, getReadableDuration } from './rendEditorSection.js';
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
    directoriesBtn.addEventListener('mouseenter', () => setSVG(directoriesIcon, 'folder-solid'));
    // on mouse leave, change to the regular SVG
    directoriesBtn.addEventListener('mouseleave', () => setSVG(directoriesIcon, 'folder'));
    // on click, change the active content section to the directories section
    directoriesBtn.addEventListener('click', () => setActiveSection('directories'));

    // on mouse enter, change to the solid SVG
    settingsBtn.addEventListener('mouseenter', () => setSVG(settingsIcon, 'settings-solid'));
    // on mouse leave, change to the regular SVG
    settingsBtn.addEventListener('mouseleave', () => setSVG(settingsIcon, 'settings'));
    // on click, change the active content section to the settings section
    settingsBtn.addEventListener('click', () => setActiveSection('settings'));

    // on mouse enter, change to the solid SVG
    recordBtn.addEventListener('mouseenter', () => setSVG(recordIcon, 'record-solid'));
    // on mouse leave, change to the regular SVG
    recordBtn.addEventListener('mouseleave', () => setSVG(recordIcon, 'record'));
    // on click, toggle the recording
    recordBtn.addEventListener('click', async () => await toggleRecordBtn(false, true, 'MANUAL'));

    // on click, reallow auto recording
    autoRecordResumeLabel.addEventListener('click', () => { 
        flags['manualStop'] = false;
        autoRecordResumeLabel.classList.remove('active');
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
            setSVG(navToggleIcon, 'arrow-back-ios');
            data['settings']['navBarActive'] = await attemptAsyncFunction(() => window.settingsAPI.setSetting('navBarActive', true), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        }
        else {
            setSVG(navToggleIcon, 'arrow-forward-ios');
            data['settings']['navBarActive'] = await attemptAsyncFunction(() => window.settingsAPI.setSetting('navBarActive', false), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        }

        // hide the resumeAutoRecord label, then show it again after 500 ms
        autoRecordResumeLabel.style.opacity = '0';
        await attemptAsyncFunction(() => new Promise(resolve => setTimeout(() => { autoRecordResumeLabel.style.opacity = ''; resolve(); }, 500)), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

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
        setSVG(navToggleIcon, 'arrow-back-ios');
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
            if (await attemptAsyncFunction(() => window.webSocketAPI.stopRecord(), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false)) {
                // set the manual stop flag
                flags['manualStop'] = manualStop;

                // set recording flag, toggle the record button, toggle the recording container
                flags['recording'] = false;
                recordBtn.classList.remove('active');
                currentRecordingLabelContainer.classList.remove('active');
                
                // clear the recording time label interval
                clearInterval(state['timerInterval']);

                // check if auto record is on and the recording was manually stopped
                if (flags['manualStop'] && data['settings']['autoRecord']) {
                    // reallow auto recording
                    autoRecordResumeLabel.classList.add('active');
                }

                // reload the gallery for the new video
                await loadGallery(false);
            }
        }
    }
    else {
        // check if it was an auto start / with no manual pause or if it was a manual start
        if ((autoStart && !flags['manualStop']) || !autoStart) {
            if (await attemptAsyncFunction(() => window.webSocketAPI.startRecord(recordingGame), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false)) {
                // set auto start flag
                flags['autoStart'] = autoStart;

                // set recording flag, toggle the record button, toggle the recording container
                flags['recording'] = true;
                recordBtn.classList.add('active');
                currentRecordingLabelContainer.classList.add('active');

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