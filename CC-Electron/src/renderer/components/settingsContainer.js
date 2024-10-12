import { GROW_FACTOR, REDUCE_FACTOR, 
    html, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, playbackSlider, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineTrack, timelineThumb, timelineState,  
    allSettingPill, allSettingToggleSwitch, saveLocationSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    settingsCache, 
    videosData } from './variables.js';

import { getClickPercentage, setSVG, setTicks, getReadableTime, setVolumeSVG, setVideoState, setBoxWidths, setGalleryGap } from './shared.js';

export { initSettingsContainer }

function initSettingsContainer() {
    loadSettingsEL();
    loadSettings();
}

function loadSettingsEL() {
    for (const setting of allSettingPill) {
        // on change, validate the setting, save it, and set the saved value
        setting.addEventListener('change', async () => {
            settingsCache[setting.name] = await window.settingsAPI.setSetting(setting.name, setting.value);
            setting.value = settingsCache[setting.name];

            console.log(settingsCache);
        });
    }

    for (const setting of allSettingToggleSwitch) {
        // on change, validate the setting, save it, and set the saved value
        setting.addEventListener('change', async () => {
            settingsCache[setting.name] = await window.settingsAPI.setSetting(setting.name, setting.checked);
            setting.checked = settingsCache[setting.name];

            console.log(settingsCache);
        });
    }

    // on change, validate the setting, save it, and set the saved value
    darkModeSettingToggleSwitch.addEventListener('change', async () => {
        settingsCache[darkModeSettingToggleSwitch.name] = await window.settingsAPI.setSetting(darkModeSettingToggleSwitch.name, darkModeSettingToggleSwitch.checked);
        darkModeSettingToggleSwitch.checked = settingsCache[darkModeSettingToggleSwitch.name];

        // set the dark mode based on the stored setting
        if (darkModeSettingToggleSwitch.checked) {
            html.dataset.theme = 'dark';
        }
        else {
            html.dataset.theme = 'light';
        }

        console.log(settingsCache);
    });

    // on change, select directory from dialog, save it, and set the saved value
    saveLocationSettingPill.addEventListener('click', async () => {
        settingsCache[saveLocationSettingPill.name] = await window.settingsAPI.setSetting(saveLocationSettingPill.name, saveLocationSettingPill.value);
        saveLocationSettingPill.value = settingsCache[saveLocationSettingPill.name];
    });
}

function loadSettings() {
    for (const setting of allSettingPill) {
        // load each settings initial value from stored settings
        setting.value = settingsCache[setting.name];
    }

    for (const setting of allSettingToggleSwitch) {
        // load each settings initial value from stored settings
        setting.checked = settingsCache[setting.name];
    }

    // load the initial value from stored setting
    darkModeSettingToggleSwitch.checked = settingsCache[darkModeSettingToggleSwitch.name];

    // set the dark mode based on the stored setting
    if (darkModeSettingToggleSwitch.checked) {
        html.dataset.theme = 'dark';
    }
    else {
        html.dataset.theme = 'light';
    }

    // load the initial value from stored setting
    saveLocationSettingPill.value = settingsCache[saveLocationSettingPill.name];
}