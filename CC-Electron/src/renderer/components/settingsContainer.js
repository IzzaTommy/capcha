import { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, playbackSlider, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineMarker, timelineSlider, timelineState,  
    allSettingPill, saveLocationSettingPill, 
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
        });
    }

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

    // load the initial value from stored settings
    saveLocationSettingPill.value = settingsCache[saveLocationSettingPill.name];
}