/**
 * Module for initializing the settings section
 * 
 * @module rendSettingsSection
 * @requires rendVariables
 * @requires rendSharedFunctions
 * @requires rendDirectoriesSection
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
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
    mediaBar, playPauseBtn, playPauseIcon, 
    volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
    currentVideoTimeLabel, currentVideoDurationLabel, 
    playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
    fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineThumb, 
    mostSettingFields, mostSettingToggleSwitches, capturesPathSettingField, darkModeSettingToggleField, darkModeSettingToggleIcon, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setIcon, getParsedTime, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';
import { initRendDirectoriesSection, loadGallery, updateGallery, getReadableAge, toggleCapturesGalleryBtn } from './rendDirectoriesSection.js';

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
    // iterate through each setting field
    for (const settingField of mostSettingFields) {
        // on change, validate the setting, save it, and set the saved value
        settingField.addEventListener('change', async () => {
            settingField.value = data['settings'][settingField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(settingField.name, settingField.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        });
    }

    // iterate through each setting toggle switch
    for (const settingToggleSwitch of mostSettingToggleSwitches) {
        // get the setting toggle field and icon
        let settingToggleField = settingToggleSwitch.querySelector('.setting-toggle-field');
        let settingToggleIcon = settingToggleSwitch.querySelector('.setting-toggle-icon > use');

        // on change, validate the setting, save it, and set the saved value
        settingToggleField.addEventListener('change', async () => {
            settingToggleField.checked = data['settings'][settingToggleField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(settingToggleField.name, settingToggleField.checked), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

            // set the icon based on if the setting toggle field is checked
            if (settingToggleField.checked) {
                setIcon(settingToggleIcon, 'enabled');
            }
            else {
                setIcon(settingToggleIcon, 'disabled');
            }
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

    // on change, validate the dark mode setting, save it, and set the saved value
    darkModeSettingToggleField.addEventListener('change', async () => {
        darkModeSettingToggleField.checked = data['settings'][darkModeSettingToggleField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(darkModeSettingToggleField.name, darkModeSettingToggleField.checked), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

        // change the theme attribute, depending on if dark mode is enabled
        if (darkModeSettingToggleField.checked) {
            setIcon(darkModeSettingToggleIcon, 'enabled');
            html.dataset.theme = 'dark';
        }
        else {
            setIcon(darkModeSettingToggleIcon, 'disabled');
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

    // iterate through each setting field
    for (const settingField of mostSettingFields) {
        // load each settings initial value from stored settings
        settingField.value = data['settings'][settingField.name];
    }

    // iterate through each setting toggle switch
    for (const settingToggleSwitch of mostSettingToggleSwitches) {
        // get the setting toggle field and icon
        let settingToggleField = settingToggleSwitch.querySelector('.setting-toggle-field');
        let settingToggleIcon = settingToggleSwitch.querySelector('.setting-toggle-icon > use');

        // load each settings initial value from stored settings
        settingToggleField.checked = data['settings'][settingToggleField.name];

        // set the icon based on if the setting toggle field is checked
        if (settingToggleField.checked) {
            setIcon(settingToggleIcon, 'enabled');
        }
        else {
            setIcon(settingToggleIcon, 'disabled');
        }
    }

    // load the initial value from stored setting
    darkModeSettingToggleField.checked = data['settings'][darkModeSettingToggleField.name];

    // change the theme attribute, depending on if dark mode is enabled
    if (darkModeSettingToggleField.checked) {
        setIcon(darkModeSettingToggleIcon, 'enabled');
        html.dataset.theme = 'dark';
    }
    else {
        setIcon(darkModeSettingToggleIcon, 'disabled');
        html.dataset.theme = 'light';
    }

    // load the initial value from stored setting
    capturesPathSettingField.value = data['settings'][capturesPathSettingField.name];
}