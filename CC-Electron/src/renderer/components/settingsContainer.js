import { 
    GROW_FACTOR, REDUCE_FACTOR, 
    html, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, timelineState, 
    allSettingPill, allSettingToggleSwitch, saveLocationSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data 
} from './variables.js';

import { setSVG, getParsedTime, resizeAll } from './shared.js';

export { initSettingsContainer }

async function initSettingsContainer() {
    initSettingsEL();
    
    await initSettings();
}

function initSettingsEL() {
    for (const setting of allSettingPill) {
        // on change, validate the setting, save it, and set the saved value
        setting.addEventListener('change', async () => {
            data['settings'][setting.name] = await window.settingsAPI.setSetting(setting.name, setting.value);
            setting.value = data['settings'][setting.name];
        });
    }

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

        // set the dark mode based on the stored setting
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

async function initSettings() {
    data['settings'] = await window.settingsAPI.getAllSettings();

    for (const setting of allSettingPill) {
        // load each settings initial value from stored settings
        setting.value = data['settings'][setting.name];
    }

    for (const setting of allSettingToggleSwitch) {
        // load each settings initial value from stored settings
        setting.checked = data['settings'][setting.name];
    }

    // load the initial value from stored setting
    darkModeSettingToggleSwitch.checked = data['settings'][darkModeSettingToggleSwitch.name];

    // set the dark mode based on the stored setting
    if (darkModeSettingToggleSwitch.checked) {
        html.dataset.theme = 'dark';
    }
    else {
        html.dataset.theme = 'light';
    }

    // load the initial value from stored setting
    saveLocationSettingPill.value = data['settings'][saveLocationSettingPill.name];
}