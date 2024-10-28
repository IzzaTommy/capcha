/**
 * Module for initializing the settings section
 * 
 * @module rendSettingsSection
 * @requires rendVariables
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
    allSettingPill, allSettingToggleSwitch, capturesPathSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, stateData 
} from './rendVariables.js';
import { setSVG, getParsedTime, resizeAll } from './rendShared.js';
import { loadGallery } from './rendDirectoriesSection.js';

/**
 * @exports initRendSettingsSection
 */
export { initRendSettingsSection }

/**
 * Initializes the settings section and its components
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

    // on change, select directory from dialog, save it, and set the saved value
    capturesPathSettingPill.addEventListener('click', async () => {
        data['settings'][capturesPathSettingPill.name] = await window.settingsAPI.setSetting(capturesPathSettingPill.name, capturesPathSettingPill.value);

        if (capturesPathSettingPill.value !== data['settings'][capturesPathSettingPill.name]) {
            capturesPathSettingPill.value = data['settings'][capturesPathSettingPill.name];
            loadGallery();
        }
    });

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
    capturesPathSettingPill.value = data['settings'][capturesPathSettingPill.name];
}