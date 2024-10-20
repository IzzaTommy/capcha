/**
 * Module for initializing the settings section
 * 
 * @module settingsSection
 * @requires variables
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
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentVideoTimeLabel, totalVideoTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, timelineState, 
    allSettingPill, allSettingToggleSwitch, saveLocationSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, stateData 
} from './variables.js';
import { setSVG, getParsedTime, resizeAll } from './shared.js';

/**
 * @exports initSettingsSection
 */
export { initSettingsSection }

/**
 * Initializes the settings section and its components
 */
async function initSettingsSection() {
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
            data['settings'][setting.name] = await window.settingsAPI.setSetting(setting.name, setting.value);
            setting.value = data['settings'][setting.name];
        });
    }

    // iterate through each setting toggle switch
    for (const setting of allSettingToggleSwitch) {
        // on change, validate the setting, save it, and set the saved value
        setting.addEventListener('change', async () => {
            data['settings'][setting.name] = await window.settingsAPI.setSetting(setting.name, setting.checked);
            setting.checked = data['settings'][setting.name];
        });
    }

    // on change, validate the setting, save it, and set the saved value
    darkModeSettingToggleSwitch.addEventListener('change', async () => {
        data['settings'][darkModeSettingToggleSwitch.name] = await window.settingsAPI.setSetting(darkModeSettingToggleSwitch.name, darkModeSettingToggleSwitch.checked);
        darkModeSettingToggleSwitch.checked = data['settings'][darkModeSettingToggleSwitch.name];

        // change the theme attribute, depending on if dark mode is enabled
        if (darkModeSettingToggleSwitch.checked) {
            html.dataset.theme = 'dark';
        }
        else {
            html.dataset.theme = 'light';
        }
    });

    // on change, select directory from dialog, save it, and set the saved value
    saveLocationSettingPill.addEventListener('click', async () => {
        data['settings'][saveLocationSettingPill.name] = await window.settingsAPI.setSetting(saveLocationSettingPill.name, saveLocationSettingPill.value);
        saveLocationSettingPill.value = data['settings'][saveLocationSettingPill.name];
    });
}

/**
 * Initializes the setting container
 */
async function initSettingContainer() {
    // get the settings
    data['settings'] = await window.settingsAPI.getAllSettings();

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
    saveLocationSettingPill.value = data['settings'][saveLocationSettingPill.name];
}