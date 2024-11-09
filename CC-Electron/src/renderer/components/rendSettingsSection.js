/**
 * Module for initializing the settings section
 * 
 * @module rendSettingsSection
 * @requires rendVariables
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
            data['settings'][setting.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(setting.name, setting.value), 3, 2000);
            setting.value = data['settings'][setting.name];
        });
    }

    // iterate through each setting toggle switch
    for (const setting of allSettingToggleSwitch) {
        // on change, validate the setting, save it, and set the saved value
        setting.addEventListener('change', async () => {
            data['settings'][setting.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(setting.name, setting.checked), 3, 2000);
            setting.checked = data['settings'][setting.name];
        });
    }

    // on change, select directory from dialog, save it, and set the saved value
    capturesPathSettingPill.addEventListener('click', async () => {
        data['settings'][capturesPathSettingPill.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(capturesPathSettingPill.name, capturesPathSettingPill.value), 3, 2000);

        if (capturesPathSettingPill.value !== data['settings'][capturesPathSettingPill.name]) {
            capturesPathSettingPill.value = data['settings'][capturesPathSettingPill.name];
            loadGallery();
        }
    });

    // on change, validate the setting, save it, and set the saved value
    darkModeSettingToggleSwitch.addEventListener('change', async () => {
        data['settings'][darkModeSettingToggleSwitch.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(darkModeSettingToggleSwitch.name, darkModeSettingToggleSwitch.checked), 3, 2000);
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
    data['settings'] = await attemptAsyncFunction(() => window.settingsAPI.getAllSettingsData(), 3, 2000);

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