/**
 * Module for initializing the settings section
 * 
 * @module rendSettingsSection
 * @requires rendVariables
 */
import { 
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    MSECONDS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, 
    html, 
    initializationOverlay, initializationStatusLabel, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, recordingContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordSVG, resumeAutoRecordLabel, 
    navToggleBtn, navToggleSVG, 
    generalStatusLabel, directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseStatusIcon, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, currentSpeedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, 
    allSettingPill, allSettingToggleSwitch, capturesPathSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setSVG, getParsedTime, resizeAll, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';
import { initRendDirectoriesSection, loadGallery, resizeGallery } from './rendDirectoriesSection.js';

/**
 * @exports initRendSettingsSection
 */
export { initRendSettingsSection }

/**
 * Initializes the settings section
 */
async function initRendSettingsSection() {
    initSettingContainerEL();
    await initSettingContainer();
}

/**
 * Initializes the setting container event listeners
 */
function initSettingContainerEL() {
    // iterate through each setting pill
    for (const setting of allSettingPill) {
        // on change, validate the setting, save it, and set the saved value
        setting.addEventListener('change', async () => {
            data['settings'][setting.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(setting.name, setting.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
            setting.value = data['settings'][setting.name];
        });
    }

    // iterate through each setting toggle switch
    for (const setting of allSettingToggleSwitch) {
        // on change, validate the setting, save it, and set the saved value
        setting.addEventListener('change', async () => {
            data['settings'][setting.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(setting.name, setting.checked), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
            setting.checked = data['settings'][setting.name];
        });
    }

    // on change, select directory from dialog, save it, and set the saved value
    capturesPathSettingPill.addEventListener('click', async () => {
        data['settings'][capturesPathSettingPill.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(capturesPathSettingPill.name, capturesPathSettingPill.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

        if (capturesPathSettingPill.value !== data['settings'][capturesPathSettingPill.name]) {
            capturesPathSettingPill.value = data['settings'][capturesPathSettingPill.name];
            await loadGallery(false);
        }
    });

    // on change, validate the setting, save it, and set the saved value
    darkModeSettingToggleSwitch.addEventListener('change', async () => {
        data['settings'][darkModeSettingToggleSwitch.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(darkModeSettingToggleSwitch.name, darkModeSettingToggleSwitch.checked), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        darkModeSettingToggleSwitch.checked = data['settings'][darkModeSettingToggleSwitch.name];

        // change the theme attribute, depending on if dark mode is enabled
        if (darkModeSettingToggleSwitch.checked) {
            html.dataset.theme = 'dark';
        }
        else {
            html.dataset.theme = 'light';
        }
    });
}

/**
 * Initializes the setting container
 */
async function initSettingContainer() {
    // get the settings
    data['settings'] = await attemptAsyncFunction(() => window.settingsAPI.getAllSettingsData(), ATTEMPTS, FAST_DELAY_IN_MSECONDS, true);

    // iterate through each setting pill
    for (const setting of allSettingPill) {
        // load each settings initial value from stored settings
        setting.value = data['settings'][setting.name];
    }

    // iterate through each setting toggle switch
    for (const setting of allSettingToggleSwitch) {
        // load each settings initial value from stored settings
        setting.checked = data['settings'][setting.name];
    }

    // load the initial value from stored setting
    darkModeSettingToggleSwitch.checked = data['settings'][darkModeSettingToggleSwitch.name];

    // change the theme attribute, depending on if dark mode is enabled
    if (darkModeSettingToggleSwitch.checked) {
        html.dataset.theme = 'dark';
    }
    else {
        html.dataset.theme = 'light';
    }

    // load the initial value from stored setting
    capturesPathSettingPill.value = data['settings'][capturesPathSettingPill.name];
}