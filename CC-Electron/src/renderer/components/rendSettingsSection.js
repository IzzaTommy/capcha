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
    titleBar, minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesIcon, settingsBtn, settingsIcon, currentRecordingContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordIcon, autoRecordResumeLabel, 
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
    for (const setting of mostSettingFields) {
        // on change, validate the setting, save it, and set the saved value
        setting.addEventListener('change', async () => {
            data['settings'][setting.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(setting.name, setting.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
            setting.value = data['settings'][setting.name];
        });
    }

    // iterate through each setting toggle switch
    for (const setting of mostSettingToggleFields) {
        // on change, validate the setting, save it, and set the saved value
        setting.addEventListener('change', async () => {
            data['settings'][setting.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(setting.name, setting.checked), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
            setting.checked = data['settings'][setting.name];
        });
    }

    // on change, select directory from dialog, save it, and set the saved value
    capturesPathSettingField.addEventListener('click', async () => {
        data['settings'][capturesPathSettingField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(capturesPathSettingField.name, capturesPathSettingField.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

        if (capturesPathSettingField.value !== data['settings'][capturesPathSettingField.name]) {
            capturesPathSettingField.value = data['settings'][capturesPathSettingField.name];
            await loadGallery(false);
        }
    });

    // on change, validate the setting, save it, and set the saved value
    darkModeSettingToggleField.addEventListener('change', async () => {
        data['settings'][darkModeSettingToggleField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(darkModeSettingToggleField.name, darkModeSettingToggleField.checked), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        darkModeSettingToggleField.checked = data['settings'][darkModeSettingToggleField.name];

        // change the theme attribute, depending on if dark mode is enabled
        if (darkModeSettingToggleField.checked) {
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
    for (const setting of mostSettingFields) {
        // load each settings initial value from stored settings
        setting.value = data['settings'][setting.name];
    }

    // iterate through each setting toggle switch
    for (const setting of mostSettingToggleFields) {
        // load each settings initial value from stored settings
        setting.checked = data['settings'][setting.name];
    }

    // load the initial value from stored setting
    darkModeSettingToggleField.checked = data['settings'][darkModeSettingToggleField.name];

    // change the theme attribute, depending on if dark mode is enabled
    if (darkModeSettingToggleField.checked) {
        html.dataset.theme = 'dark';
    }
    else {
        html.dataset.theme = 'light';
    }

    // load the initial value from stored setting
    capturesPathSettingField.value = data['settings'][capturesPathSettingField.name];
}